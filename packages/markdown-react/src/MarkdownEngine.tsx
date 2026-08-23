import type React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import type { Components, Options } from 'react-markdown';
import {
  normalizeMarkdown,
  mergeAttributes,
  type SanitizeSchemaExtension,
} from '@eventuras/markdown-core';
import type { MarkdownCodeBlockProps, MarkdownRenderers } from './renderers';

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

/**
 * The options shared by every design-system binding of the engine —
 * `MarkdownContent`'s public props are exactly this type.
 */
export type MarkdownRenderOptions = {
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
   * Component that renders fenced code blocks instead of the renderer set's
   * (un-highlighted) default. This is the opt-in seam for syntax highlighting
   * — pass `@eventuras/ratio-ui-shiki`'s CodeBlock and fences highlight, with
   * everything else unchanged:
   *
   * ```tsx
   * import { CodeBlock as ShikiCodeBlock } from '@eventuras/ratio-ui-shiki/CodeBlock';
   * <MarkdownContent markdown={md} codeBlock={ShikiCodeBlock} />
   * ```
   *
   * Inline code is unaffected (stays the `inlineCode` renderer).
   */
  codeBlock?: React.ComponentType<MarkdownCodeBlockProps>;
};

export type MarkdownEngineProps = MarkdownRenderOptions & {
  /** Design-system mapping for the rendered elements. */
  renderers: MarkdownRenderers;
};

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

const DefaultImage: NonNullable<MarkdownRenderers['image']> = ({ src, alt, ...props }) => (
  <img
    src={src}
    alt={alt}
    {...props}
    loading="lazy"
    decoding="async"
    referrerPolicy="no-referrer"
  />
);

const DefaultStrong: NonNullable<MarkdownRenderers['strong']> = (props) => <strong {...props} />;

const DefaultEm: NonNullable<MarkdownRenderers['em']> = (props) => <em {...props} />;

/**
 * The design-system-agnostic markdown renderer: parsing, GFM, sanitization,
 * URL policy, and fence extraction — with every visible element delegated to
 * a `MarkdownRenderers` set. Nothing in this package may import a design
 * system; binding packages like `@eventuras/markdown` supply the renderers.
 */
export const MarkdownEngine = ({
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
  renderers,
}: MarkdownEngineProps) => {
  if (!markdown) return null;

  const {
    heading: HeadingSlot,
    paragraph: ParagraphSlot,
    link: LinkSlot,
    list: ListSlot,
    listItem: ListItemSlot,
    blockquote: BlockquoteSlot,
    inlineCode: InlineCodeSlot,
    codeBlock: DefaultFence,
    divider: DividerSlot,
    image: ImageSlot = DefaultImage,
    strong: StrongSlot = DefaultStrong,
    em: EmSlot = DefaultEm,
  } = renderers;

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

  const headingComponent =
    (level: 1 | 2 | 3 | 4 | 5 | 6): Components['h1'] =>
    ({ node, children, ...props }) => (
      <HeadingSlot level={level} {...props}>
        {children}
      </HeadingSlot>
    );

  // Translate react-markdown's element overrides into renderer-slot calls.
  // Slots never see hast `node`s, and HTML's deprecated `color` attribute is
  // dropped where react-markdown's types carry it (it collides with
  // design-system color props).
  const components: Components = {
    a: ({ node, href, children, ...props }) => {
      // Block external links if not allowed (rehype-sanitize already handles dangerous protocols)
      if (!allowExternalLinks && isExternalUrl(href)) {
        return <span>{children}</span>;
      }
      return (
        <LinkSlot href={href || ''} {...props}>
          {children}
        </LinkSlot>
      );
    },
    img: ({ node, src, alt, ...props }) => {
      // Block external images if not allowed (rehype-sanitize already handles dangerous protocols)
      if (!allowExternalLinks && isExternalUrl(src)) {
        return null;
      }
      return <ImageSlot src={src} alt={alt} {...props} />;
    },
    p: ({ node, color, children, ...props }) => (
      <ParagraphSlot {...props}>{children}</ParagraphSlot>
    ),
    h1: headingComponent(1),
    h2: headingComponent(2),
    h3: headingComponent(3),
    h4: headingComponent(4),
    h5: headingComponent(5),
    h6: headingComponent(6),
    ul: ({ node, ...props }) => <ListSlot ordered={false} {...props} />,
    ol: ({ node, ...props }) => <ListSlot ordered={true} {...props} />,
    li: ({ node, ...props }) => <ListItemSlot {...props} />,
    blockquote: ({ node, children, className, cite }) => (
      <BlockquoteSlot className={className} cite={cite}>
        {children}
      </BlockquoteSlot>
    ),
    code: ({ node, className, children, ...props }) => {
      // Inline code (no `language-` class) goes to the inlineCode renderer.
      // Fenced blocks (`language-*`) are rendered by the `pre` override below
      // — here the element is passed through so `pre` can read its language
      // class and text.
      const isBlock = className?.startsWith('language-');
      if (isBlock) {
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      }
      return <InlineCodeSlot className={className}>{children}</InlineCodeSlot>;
    },
    pre: ({ children }) => {
      // react-markdown wraps a fence as `<pre><code class="language-…">…</code></pre>`.
      // Pull the text + language out of that single <code> child and hand the
      // codeBlock renderer a plain `{ code, language }` call instead of a
      // bare, hardcoded-grey <pre>.
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
      const FenceBlock = codeBlock ?? DefaultFence;
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
    hr: ({ node, className }) => <DividerSlot className={className} />,
    strong: ({ node, ...props }) => <StrongSlot {...props} />,
    em: ({ node, ...props }) => <EmSlot {...props} />,
  };

  const finalComponents: any = customComponents
    ? { ...components, ...customComponents }
    : components;

  return (
    <>
      {heading && <HeadingSlot level={2}>{heading}</HeadingSlot>}
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
