/* @vitest-environment jsdom */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import rehypeRaw from 'rehype-raw';
import {
  MarkdownEngine,
  type MarkdownRenderers,
  type MarkdownCodeBlockProps,
} from './index';

// A minimal plain-HTML renderer set — the engine must be fully usable
// without any design system.
const renderers: MarkdownRenderers = {
  heading: ({ level, children, ...rest }) => {
    const Tag = `h${level}` as const;
    return <Tag {...rest}>{children}</Tag>;
  },
  paragraph: ({ children, ...rest }) => <p {...rest}>{children}</p>,
  link: ({ href, children, ...rest }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
  list: ({ ordered, children, ...rest }) =>
    ordered ? <ol {...rest}>{children}</ol> : <ul {...rest}>{children}</ul>,
  listItem: ({ children, ...rest }) => <li {...rest}>{children}</li>,
  blockquote: ({ cite, children, ...rest }) => (
    <blockquote cite={cite} {...rest}>
      {children}
    </blockquote>
  ),
  inlineCode: ({ children, ...rest }) => <code {...rest}>{children}</code>,
  codeBlock: ({ code, language }) => (
    <pre data-testid="fence" data-language={language}>
      {code}
    </pre>
  ),
  divider: ({ className }) => <hr className={className} />,
};

const engine = (props: Partial<React.ComponentProps<typeof MarkdownEngine>>) => (
  <MarkdownEngine renderers={renderers} {...props} />
);

describe('MarkdownEngine', () => {
  it('renders headings and paragraphs through the renderer slots', () => {
    render(engine({ markdown: '## Section\n\nBody text' }));
    expect(screen.getByRole('heading', { level: 2, name: 'Section' })).toBeInTheDocument();
    expect(screen.getByText('Body text')).toBeInTheDocument();
  });

  it('renders the heading prop at level 2', () => {
    render(engine({ heading: 'Title', markdown: 'x' }));
    expect(screen.getByRole('heading', { level: 2, name: 'Title' })).toBeInTheDocument();
  });

  it('blocks external links by default and allows them on opt-in', () => {
    const md = '[go](https://example.com)';
    const { container, rerender } = render(engine({ markdown: md }));
    expect(screen.queryByRole('link')).toBeNull();
    expect(container).toHaveTextContent('go');

    rerender(engine({ markdown: md, allowExternalLinks: true }));
    expect(screen.getByRole('link', { name: 'go' })).toHaveAttribute(
      'href',
      'https://example.com'
    );
  });

  it('runs sanitization after consumer rehype plugins', () => {
    const { container } = render(
      engine({
        markdown: '<div onclick="alert(1)">X</div><script>alert(2)</script>',
        rehypePlugins: [rehypeRaw],
      })
    );
    expect(screen.getByText('X')).toBeInTheDocument();
    expect(container.querySelector('[onclick]')).toBeNull();
    expect(container.querySelector('script')).toBeNull();
  });

  it('extracts fences to the codeBlock renderer with code and language', () => {
    render(engine({ markdown: '```ts\nconst x = 1;\n```' }));
    const fence = screen.getByTestId('fence');
    expect(fence).toHaveAttribute('data-language', 'ts');
    expect(fence).toHaveTextContent('const x = 1;');
  });

  it('lets the codeBlock prop override the renderer set', () => {
    let seen: MarkdownCodeBlockProps | undefined;
    const Override = (props: MarkdownCodeBlockProps) => {
      seen = props;
      return <div data-testid="override" />;
    };
    render(engine({ markdown: '```\nplain\n```', codeBlock: Override }));
    expect(screen.getByTestId('override')).toBeInTheDocument();
    expect(seen).toMatchObject({
      code: 'plain',
      language: 'Text',
      showLineNumbers: false,
      showDownload: false,
      showCollapse: false,
    });
  });

  it('keeps inline code in the inlineCode renderer', () => {
    const { container } = render(engine({ markdown: 'Inline `code` here' }));
    expect(screen.queryByTestId('fence')).toBeNull();
    expect(container.querySelector('code')).toHaveTextContent('code');
  });

  it('forwards sanitized ids so GFM footnote anchors survive', () => {
    const { container } = render(
      engine({ markdown: 'Text[^1]\n\n[^1]: The note.' })
    );
    // Prefix-agnostic: gfm + sanitize each clobber-prefix the id. What matters
    // is that the renderer received and rendered it.
    expect(container.querySelector('a[id*="fnref"]')).not.toBeNull();
  });

  it('falls back to plain strong/em defaults when the slots are omitted', () => {
    const { container } = render(engine({ markdown: 'a **b** *c*' }));
    expect(container.querySelector('strong')).toHaveTextContent('b');
    expect(container.querySelector('em')).toHaveTextContent('c');
  });
});
