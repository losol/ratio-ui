import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildFrameDocument } from '../scripts/frame-document.mjs';
import { SANDBOX_FRAME_SOURCE, SANDBOX_HOST_SOURCE } from '../src/Sandbox/protocol';

const manifest = {
  imports: {
    react: 'react.js',
    'react-dom/client': 'react-dom-client.js',
    '@eventuras/ratio-ui/core/Button': 'ratio-ui/core/Button.js',
    'odd</script><script>alert(1)</script>': 'odd.js',
  },
  stylesheets: ['fonts.css', 'ratio-ui.css'],
};

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');
const cspOf = (doc: Document) =>
  doc.querySelector('meta[http-equiv="Content-Security-Policy"]')?.getAttribute('content') ?? '';

describe('buildFrameDocument', () => {
  const html = buildFrameDocument(manifest);
  const doc = parse(html);

  it('maps every specifier to a path next to the frame', () => {
    const importMap = JSON.parse(doc.querySelector('script[type="importmap"]')?.textContent ?? '');
    expect(importMap.imports.react).toBe('./react.js');
    expect(importMap.imports['@eventuras/ratio-ui/core/Button']).toBe('./ratio-ui/core/Button.js');
    expect(Object.keys(importMap.imports)).toHaveLength(4);
  });

  it('keeps a hostile specifier inside the import map', () => {
    expect(doc.querySelectorAll('script')).toHaveLength(2);
  });

  it('allows exactly the inline import map, by hash, and no other inline script', () => {
    const importMap = doc.querySelector('script[type="importmap"]')?.textContent ?? '';
    const hash = createHash('sha256').update(importMap).digest('base64');
    const scriptSrc = cspOf(doc)
      .split('; ')
      .find((directive) => directive.startsWith('script-src'));
    expect(scriptSrc).toBe(`script-src 'self' blob: 'sha256-${hash}'`);
  });

  it('blocks network calls, form posts and anything not listed', () => {
    const csp = cspOf(doc);
    expect(csp).toContain("default-src 'none'");
    expect(csp).toContain("connect-src 'none'");
    expect(csp).toContain("form-action 'none'");
    expect(csp).not.toContain('*');
    expect(csp).not.toContain('http');
  });

  it('declares the import map before the module script, and loads the stylesheets', () => {
    const scripts = [...doc.querySelectorAll('script')];
    expect(scripts[0].type).toBe('importmap');
    expect(scripts[1].getAttribute('src')).toBe('./frame.js');
    expect([...doc.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.getAttribute('href'))).toEqual([
      './fonts.css',
      './ratio-ui.css',
    ]);
  });
});

describe('frame.js', () => {
  const source = readFileSync(resolve(import.meta.dirname, '../scripts/frame.js'), 'utf8');

  it('uses the same message tags as the component', () => {
    expect(source).toContain(`const FRAME = '${SANDBOX_FRAME_SOURCE}';`);
    expect(source).toContain(`const HOST = '${SANDBOX_HOST_SOURCE}';`);
  });

  it('only listens to the page that embeds it', () => {
    expect(source).toContain('event.source !== parent');
  });
});
