import { describe, expect, it } from 'vitest';
import { resolveRuntime, type SandboxRuntimeManifest } from '../src/resolveRuntime';
import { runtimeOrigins } from '../src/Sandbox/buildSandboxDocument';

const manifest: SandboxRuntimeManifest = {
  versions: { react: '19.3.1' },
  imports: {
    react: 'react.js',
    'react-dom': 'react-dom.js',
    'react-dom/client': 'react-dom-client.js',
    'react/jsx-runtime': 'react-jsx-runtime.js',
    '@eventuras/ratio-ui/core/Button': 'ratio-ui/core/Button.js',
    '@eventuras/ratio-ui/core/Card': 'ratio-ui/core/Card.js',
  },
  stylesheets: ['fonts.css', 'ratio-ui.css'],
};

describe('resolveRuntime', () => {
  it('resolves every path against the base URL, with or without a trailing slash', () => {
    const withSlash = resolveRuntime(manifest, 'https://example.org/sandbox-runtime/0.1.0/');
    const without = resolveRuntime(manifest, 'https://example.org/sandbox-runtime/0.1.0');

    expect(without).toEqual(withSlash);
    expect(withSlash.imports['@eventuras/ratio-ui/core/Button']).toBe(
      'https://example.org/sandbox-runtime/0.1.0/ratio-ui/core/Button.js',
    );
    expect(withSlash.stylesheets).toEqual([
      'https://example.org/sandbox-runtime/0.1.0/fonts.css',
      'https://example.org/sandbox-runtime/0.1.0/ratio-ui.css',
    ]);
    expect(runtimeOrigins(withSlash)).toEqual(['https://example.org']);
  });

  it('keeps only what the code imports, plus what React needs', () => {
    const runtime = resolveRuntime(manifest, 'https://example.org/rt/', {
      specifiers: ['react', '@eventuras/ratio-ui/core/Button'],
    });
    expect(Object.keys(runtime.imports).sort()).toEqual([
      '@eventuras/ratio-ui/core/Button',
      'react',
      'react-dom/client',
      'react/jsx-runtime',
    ]);
  });

  it('names an import the runtime does not have', () => {
    expect(() =>
      resolveRuntime(manifest, 'https://example.org/rt/', { specifiers: ['lodash'] }),
    ).toThrow('"lodash" is not available in the sandbox runtime.');
  });

  it('rejects a base URL that is not absolute', () => {
    expect(() => resolveRuntime(manifest, '/sandbox-runtime/')).toThrow(/absolute/);
  });
});
