import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { Link } from '@eventuras/ratio-ui/core/Link';
import { List } from '@eventuras/ratio-ui/core/List';
import { CodeBlock } from '@eventuras/ratio-ui/core/CodeBlock';
import { Blockquote } from '@eventuras/ratio-ui/core/Blockquote';
import { InlineCode } from '@eventuras/ratio-ui/core/InlineCode';
import { Divider } from '@eventuras/ratio-ui/core/Divider';
import type { MarkdownRenderers } from '../core/renderers';

/**
 * The Ratio UI renderer set — maps each engine slot to a ratio-ui component.
 * All parsing, sanitization, and URL policy already happened in the engine;
 * these are plain prop-to-component mappings.
 */
export const ratioRenderers: MarkdownRenderers = {
  heading: ({ level, children, ...props }) => (
    <Heading as={`h${level}`} {...props}>
      {children}
    </Heading>
  ),
  // `children` is passed explicitly (TextProps is a text-or-children union, and
  // a spread optional `children` doesn't narrow it).
  paragraph: ({ children, ...props }) => (
    <Text as="p" paddingBottom="xs" {...props}>
      {children}
    </Text>
  ),
  link: ({ href, children, ...props }) => (
    <Link
      href={href}
      componentProps={{
        rel: 'noopener noreferrer',
        target: '_blank',
      }}
      {...props}
    >
      {children}
    </Link>
  ),
  list: ({ ordered, ...props }) => (
    <List as={ordered ? 'ol' : 'ul'} variant="markdown" {...props} />
  ),
  listItem: (props) => <List.Item {...props} />,
  // Deliberately forwards only className/cite — Blockquote owns the rest.
  blockquote: ({ children, className, cite }) => (
    <Blockquote className={className} cite={cite}>
      {children}
    </Blockquote>
  ),
  inlineCode: ({ className, children }) => (
    <InlineCode className={className}>{children}</InlineCode>
  ),
  codeBlock: CodeBlock,
  divider: ({ className }) => <Divider className={className} />,
  strong: (props) => <strong className="font-bold" {...props} />,
  em: (props) => <em className="italic" {...props} />,
};
