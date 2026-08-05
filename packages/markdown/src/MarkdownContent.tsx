import type React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import type { Components, Options } from 'react-markdown';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { Link } from '@eventuras/ratio-ui/core/Link';
import { List } from '@eventuras/ratio-ui/core/List';
import { CodeBlock } from '@eventuras/ratio-ui/core/CodeBlock';
import { Blockquote } from '@eventuras/ratio-ui/core/Blockquote';
import { InlineCode } from '@eventuras/ratio-ui/core/InlineCode';
import { Divider } from '@eventuras/ratio-ui/core/Divider';
import { normalizeMarkdown } from './normalizeMarkdown';
import { mergeAttributes } from './mergeSanitizeSchemas';

export type SanitizeSchemaExtension = {
  tagNames?: string[];
  attributes?: Record<string, string[]>;
};

/**
 * Props a `codeBlock` override receives — the exact call the built-in
 * CodeBlock rendering gets, so any CodeBlock-compatible component (e.g.
 * `@eventuras/ratio-ui-shiki`'s) is a drop-in that matches the default
 * appearance. Components that only need the content can ignore the chrome
 * flags; they are required here (not optional) because `MarkdownContent`
 * always passes them — marking them optional would reject override
 * components whose own props require the flags.
 */
export type MarkdownCodeBlockProps = {
  /** Code inside the fence, trailing newline stripped. */
  code: string;
  /** Fence language (`ts` for ```ts). `'Text'` when the fence has none. */
  language: string;
  showLineNumbers: boolean;
  showDownload: boolean;
  showCollapse: boolean;
};

/**
 * Component overrides for the renderer: typed overrides for standard HTML
 * elements, plus custom element names emitted by remark plugins (e.g.
 * `callout`).
 *
 * This is structurally react-markdown's `Components` type, aliased here so
 * consumers import it from this package rather than reaching into
 * react-markdown directly — and so the name stays stable if the renderer
 * underneath ever changes.
 */
export type MarkdownComponents = Partial<Components> &
  Record<string, React.ComponentType<any>>;

/**
 * Plugin list accepted by `remarkPlugins` and `rehypePlugins` — structurally
 * unified's `PluggableList`, derived from react-markdown's own `Options` so it
 * cannot drift from what the renderer accepts. Aliased here for the same
 * reason as `MarkdownComponents`: consumers import it from this package rather
 * than reaching into react-markdown or unified directly.
 */
export type MarkdownPluginList = NonNullable<Options['remarkPlugins']>;

export type MarkdownContentProps = {
  markdown?: string | null;
  heading?: string;
  /** Keep invisible/control characters instead of stripping them. Default: false */
  keepInvisibleCharacters?: boolean;
  /** Allow external/absolute URLs in links and images. Default: false (only relative URLs allowed) */
  allowExternalLinks?: boolean;
  /** Strip HTML tags from input before processing. Useful for legacy content with HTML-wrapped markdown. Default: false */
  stripHtmlTags?: boolean;
  /** Custom component overrides applied on top of defaults.
   *  Accepts standard HTML tag overrides and custom element names from remark plugins. */
  customComponents?: MarkdownComponents;
  /** Additional remark plugins to run (after remark-gfm) */
  remarkPlugins?: MarkdownPluginList;
  /**
   * Additional rehype plugins. They run *before* sanitization — which always
   * runs last and cannot be replaced — so markup a plugin introduces is still
   * filtered by the sanitize schema (extend it via `sanitizeSchemaExtension`
   * if a plugin needs tags the default schema drops).
   *
   * This is the seam for raw HTML. `rehype-raw` is not a dependency of this
   * package — it is ~50 kB gzipped, more than half the parser's total weight,
   * for a feature most content doesn't use — so install it yourself and pass
   * it in:
   *
   * ```tsx
   * import rehypeRaw from 'rehype-raw';
   * <MarkdownContent markdown={md} rehypePlugins={[rehypeRaw]} />
   * ```
   */
  rehypePlugins?: MarkdownPluginList;
  /** Extend the sanitize schema to allow custom elements/attributes from plugins */
  sanitizeSchemaExtension?: SanitizeSchemaExtension;
  /**
   * Component that renders fenced code blocks instead of the default
   * (un-highlighted) `@eventuras/ratio-ui` CodeBlock. This is the opt-in seam
   * for syntax highlighting — pass `@eventuras/ratio-ui-shiki`'s CodeBlock and
   * fences highlight, with everything else unchanged:
   *
   * ```tsx
   * import { CodeBlock as ShikiCodeBlock } from '@eventuras/ratio-ui-shiki/CodeBlock';
   * <MarkdownContent markdown={md} codeBlock={ShikiCodeBlock} />
   * ```
   *
   * Inline code is unaffected (stays `InlineCode`).
   */
  codeBlock?: React.ComponentType<MarkdownCodeBlockProps>;
};

export const MarkdownContent = ({
  markdown,
  heading,
  keepInvisibleCharacters = false,
  allowExternalLinks = false,
  stripHtmlTags = false,
  customComponents,
  remarkPlugins: extraRemarkPlugins,
  rehypePlugins: extraRehypePlugins,
  sanitizeSchemaExtension,
  codeBlock,
}: MarkdownContentProps) => {
  if (!markdown) return null;

  // Strip HTML tags if requested (useful for legacy content with HTML-wrapped markdown)
  let processedMarkdown = markdown;
  if (stripHtmlTags) {
    processedMarkdown = markdown.replaceAll(/<[^>]*>/g, '');
  }

  const source = keepInvisibleCharacters ? processedMarkdown : normalizeMarkdown(processedMarkdown);

  // rehype-sanitize with defaultSchema (GitHub-style sanitization) handles:
  // - Blocking javascript:, data:, and other dangerous URL protocols
  // - Stripping script tags and dangerous attributes (onclick, onerror, etc.)
  // - Allowing standard HTML tags including strong, em, etc.
  //
  // We only need to add external link filtering in component overrides when allowExternalLinks=false

  // Helper to check if a URL points to an external origin
  const isExternalUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    try {
      const parsed = new URL(url, 'https://dummy.local');
      return parsed.host !== 'dummy.local';
    } catch {
      return false;
    }
  };

  // Build sanitize schema, merging any extensions from plugins
  const sanitizeSchema = sanitizeSchemaExtension
    ? {
        ...defaultSchema,
        tagNames: [
          ...new Set([
            ...(defaultSchema.tagNames ?? []),
            ...(sanitizeSchemaExtension.tagNames ?? []),
          ]),
        ],
        // Per-tag concatenation, not a shallow spread: extending a tag the
        // default schema already covers must add to its allowlist, not replace it.
        attributes: mergeAttributes(
          defaultSchema.attributes,
          sanitizeSchemaExtension.attributes
        ),
      }
    : defaultSchema;

  // Sanitization runs last, always. Consumer plugins go first so anything they
  // introduce — raw HTML via rehype-raw, custom elements — still has to pass
  // the schema on the way out.
  const rehypePlugins: MarkdownPluginList = [
    ...(extraRehypePlugins ?? []),
    [rehypeSanitize, sanitizeSchema],
  ];

  // Component overrides for custom rendering
  const components: Components = {
    a: ({ node, href, children, ...props }) => {
      // Block external links if not allowed (rehype-sanitize already handles dangerous protocols)
      if (!allowExternalLinks && isExternalUrl(href)) {
        return <span>{children}</span>;
      }
      return (
        <Link
          href={href || ''}
          componentProps={{
            rel: 'noopener noreferrer',
            target: '_blank',
          }}
          {...props}
        >
          {children}
        </Link>
      );
    },
    img: ({ node, src, alt, ...props }) => {
      // Block external images if not allowed (rehype-sanitize already handles dangerous protocols)
      if (!allowExternalLinks && isExternalUrl(src)) {
        return null;
      }
      return (
        <img
          src={src}
          alt={alt}
          {...props}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />
      );
    },
    // `children` is passed explicitly (TextProps is a text-or-children union, and
    // a spread optional `children` doesn't narrow it), and HTML's deprecated
    // `color` attribute is dropped — it collides with Text's own TextColor union.
    p: ({ node, color, children, ...props }) => (
      <Text as="p" paddingBottom="xs" {...props}>
        {children}
      </Text>
    ),
    h1: ({ node, children, ...props }) => (
      <Heading as="h1" {...props}>
        {children}
      </Heading>
    ),
    h2: ({ node, children, ...props }) => (
      <Heading as="h2" {...props}>
        {children}
      </Heading>
    ),
    h3: ({ node, children, ...props }) => (
      <Heading as="h3" {...props}>
        {children}
      </Heading>
    ),
    h4: ({ node, children, ...props }) => (
      <Heading as="h4" {...props}>
        {children}
      </Heading>
    ),
    h5: ({ node, children, ...props }) => (
      <Heading as="h5" {...props}>
        {children}
      </Heading>
    ),
    h6: ({ node, children, ...props }) => (
      <Heading as="h6" {...props}>
        {children}
      </Heading>
    ),
    ul: ({ node, ...props }) => (
      <List as="ul" variant="markdown" {...props} />
    ),
    ol: ({ node, ...props }) => (
      <List as="ol" variant="markdown" {...props} />
    ),
    li: ({ node, ...props }) => <List.Item {...props} />,
    blockquote: ({ node, children, className, cite }) => (
      <Blockquote className={className} cite={cite}>
        {children}
      </Blockquote>
    ),
    code: ({ node, className, children, ...props }) => {
      // Inline code (no `language-` class) becomes a token-styled pill. Fenced
      // blocks (`language-*`) are rendered by the `pre` override below as a
      // CodeBlock — here the element is passed through so `pre` can read its
      // language class and text.
      const isBlock = className?.startsWith('language-');
      if (isBlock) {
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      }
      return <InlineCode className={className}>{children}</InlineCode>;
    },
    pre: ({ children }) => {
      // react-markdown wraps a fence as `<pre><code class="language-…">…</code></pre>`.
      // Pull the text + language out of that single <code> child and render a
      // theme-aware CodeBlock instead of a bare, hardcoded-grey <pre>.
      const codeEl = Array.isArray(children) ? children[0] : children;
      const codeProps =
        codeEl && typeof codeEl === 'object' && 'props' in codeEl
          ? (codeEl as React.ReactElement<{ className?: string; children?: React.ReactNode }>)
              .props
          : undefined;
      const raw = codeProps?.children;
      const text =
        typeof raw === 'string' ? raw : Array.isArray(raw) ? raw.join('') : String(raw ?? '');
      // `\S+` (not `\w+`) so info strings with dashes/symbols survive, e.g.
      // `objective-c`, `c++`. The class holds a single token, so there is no
      // trailing metadata to guard against.
      const language = /language-(\S+)/.exec(codeProps?.className ?? '')?.[1];
      const FenceBlock = codeBlock ?? CodeBlock;
      return (
        <FenceBlock
          code={text.replace(/\r?\n$/, '')}
          language={language ?? 'Text'}
          showLineNumbers={false}
          showDownload={false}
          showCollapse={false}
        />
      );
    },
    hr: ({ node, className }) => <Divider className={className} />,
    strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
    em: ({ node, ...props }) => <em className="italic" {...props} />,
  };

  const finalComponents: any = customComponents
    ? { ...components, ...customComponents }
    : components;

  return (
    <>
      {heading && <Heading as="h2">{heading}</Heading>}
      <ReactMarkdown
        remarkPlugins={[remarkGfm, ...(extraRemarkPlugins ?? [])]}
        rehypePlugins={rehypePlugins}
        components={finalComponents}
      >
        {source}
      </ReactMarkdown>
    </>
  );
};
