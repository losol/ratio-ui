import React from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Sandbox } from '../src/Sandbox/Sandbox';
import {
  buildSandboxDocument,
  runtimeOrigins,
  type SandboxRuntime,
} from '../src/Sandbox/buildSandboxDocument';

const runtime: SandboxRuntime = {
  imports: {
    react: 'https://runtime.example/v1/react.js',
    'react-dom/client': 'https://runtime.example/v1/react-dom-client.js',
    '@eventuras/ratio-ui/core/Button': 'https://cdn.example/ratio-ui/core/Button/index.js',
  },
  stylesheets: ['https://cdn.example/ratio-ui/ratio-ui.css'],
};

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');

afterEach(cleanup);

describe('buildSandboxDocument', () => {
  it('carries code and props as inert data, whatever they contain', () => {
    const code = `export default () => '</script><script>alert(1)</script><!--';`;
    const props = { label: '</script><img src=x onerror=alert(1)>' };
    const html = buildSandboxDocument({ id: 'a', code, runtime, props });
    const doc = parse(html);

    // Importmap, config and bootstrap: the hostile strings added no elements.
    expect(doc.querySelectorAll('script')).toHaveLength(3);
    expect(doc.querySelector('img')).toBeNull();

    const config = JSON.parse(doc.querySelector('#sandbox-config')?.textContent ?? '');
    expect(config).toEqual({ id: 'a', code, props });
  });

  it('declares the import map before any module script', () => {
    const doc = parse(buildSandboxDocument({ id: 'a', code: '', runtime }));
    const scripts = [...doc.querySelectorAll('script')];
    expect(scripts[0].type).toBe('importmap');
    expect(JSON.parse(scripts[0].textContent ?? '')).toEqual({ imports: runtime.imports });
    expect(scripts.at(-1)?.type).toBe('module');
  });

  it('limits the frame to the runtime origins and blocks network calls', () => {
    const doc = parse(buildSandboxDocument({ id: 'a', code: '', runtime }));
    const csp = doc.querySelector('meta[http-equiv="Content-Security-Policy"]')?.getAttribute('content');
    expect(csp).toContain("default-src 'none'");
    expect(csp).toContain("connect-src 'none'");
    expect(csp).toContain(
      "script-src 'unsafe-inline' blob: https://runtime.example https://cdn.example",
    );
    expect(csp).not.toContain('*');
  });

  it('sets language and theme on the root element, escaped', () => {
    const doc = parse(
      buildSandboxDocument({
        id: 'a',
        code: '',
        runtime,
        lang: 'nb',
        theme: 'bureau"><script>',
        colorScheme: 'dark',
      }),
    );
    expect(doc.documentElement.lang).toBe('nb');
    expect(doc.documentElement.dataset.theme).toBe('bureau"><script>');
    expect(doc.documentElement.dataset.colorScheme).toBe('dark');
    expect(doc.querySelectorAll('script')).toHaveLength(3);
  });

  it('rejects runtime URLs that cannot resolve in a frame without an origin', () => {
    expect(() => runtimeOrigins({ imports: { react: '/runtime/react.js' } })).toThrow(/absolute/);
    expect(() => runtimeOrigins({ imports: { react: 'javascript:alert(1)' } })).toThrow(/absolute/);
    expect(runtimeOrigins(runtime)).toEqual(['https://runtime.example', 'https://cdn.example']);
  });
});

describe('Sandbox', () => {
  const frame = () => screen.getByTitle('Counter') as HTMLIFrameElement;

  const configId = (iframe: HTMLIFrameElement): string =>
    JSON.parse(parse(iframe.srcdoc).querySelector('#sandbox-config')?.textContent ?? '').id;

  const postFromFrame = (iframe: HTMLIFrameElement, data: unknown, source?: Window | null) =>
    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', { data, source: source ?? iframe.contentWindow }),
      );
    });

  it('renders a frame that may run scripts and nothing more', () => {
    render(<Sandbox title="Counter" code="export default () => null;" runtime={runtime} />);
    expect(frame().getAttribute('sandbox')).toBe('allow-scripts');
    expect(frame().getAttribute('referrerpolicy')).toBe('no-referrer');
    expect(frame().style.height).toBe('120px');
  });

  it('follows the height the content reports, within its bounds', () => {
    render(
      <Sandbox title="Counter" code="" runtime={runtime} minHeight={100} maxHeight={500} />,
    );
    const iframe = frame();
    const id = configId(iframe);

    postFromFrame(iframe, { source: 'ratio-ui-sandbox', id, type: 'resize', height: 240 });
    expect(iframe.style.height).toBe('240px');

    postFromFrame(iframe, { source: 'ratio-ui-sandbox', id, type: 'resize', height: 90000 });
    expect(iframe.style.height).toBe('500px');

    postFromFrame(iframe, { source: 'ratio-ui-sandbox', id, type: 'resize', height: 3 });
    expect(iframe.style.height).toBe('100px');
  });

  it('ignores messages that do not come from its own frame', () => {
    render(<Sandbox title="Counter" code="" runtime={runtime} />);
    const iframe = frame();
    const id = configId(iframe);

    postFromFrame(iframe, { source: 'ratio-ui-sandbox', id, type: 'resize', height: 300 }, window);
    postFromFrame(iframe, { source: 'ratio-ui-sandbox', id: 'other', type: 'resize', height: 300 });
    postFromFrame(iframe, { source: 'someone-else', id, type: 'resize', height: 300 });
    postFromFrame(iframe, 'resize');

    expect(iframe.style.height).toBe('120px');
  });

  it('replaces the frame with a message when the code fails', () => {
    const onError = vi.fn();
    render(
      <Sandbox
        title="Counter"
        code=""
        runtime={runtime}
        onError={onError}
        labels={{ error: 'Eksempelet kunne ikke vises.' }}
      />,
    );
    const iframe = frame();
    postFromFrame(iframe, {
      source: 'ratio-ui-sandbox',
      id: configId(iframe),
      type: 'error',
      message: 'boom',
    });

    expect(screen.queryByTitle('Counter')).toBeNull();
    expect(screen.getByRole('alert').textContent).toBe('Eksempelet kunne ikke vises.');
    expect(onError).toHaveBeenCalledWith('boom');
  });

  it('shows the message instead of a frame when the runtime is not usable', () => {
    render(<Sandbox title="Counter" code="" runtime={{ imports: { react: './react.js' } }} />);
    expect(screen.queryByTitle('Counter')).toBeNull();
    expect(screen.getByRole('alert')).toBeTruthy();
  });

  it('runs again when the code changes', () => {
    const { rerender } = render(<Sandbox title="Counter" code="one" runtime={runtime} />);
    const iframe = frame();
    postFromFrame(iframe, {
      source: 'ratio-ui-sandbox',
      id: configId(iframe),
      type: 'error',
      message: 'boom',
    });
    expect(screen.queryByTitle('Counter')).toBeNull();

    rerender(<Sandbox title="Counter" code="two" runtime={{ ...runtime }} />);
    expect(frame().srcdoc).toContain('"code":"two"');
  });

  it('does not reload the frame when the runtime object is recreated', () => {
    const { rerender } = render(<Sandbox title="Counter" code="one" runtime={runtime} />);
    const before = frame().srcdoc;
    rerender(<Sandbox title="Counter" code="one" runtime={structuredClone(runtime)} />);
    expect(frame().srcdoc).toBe(before);
  });
});
