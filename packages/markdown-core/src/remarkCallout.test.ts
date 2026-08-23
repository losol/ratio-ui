import { describe, it, expect } from 'vitest';
import type { Blockquote, Root } from 'mdast';
import { remarkCallout } from './remarkCallout';

const blockquote = (text: string): Blockquote => ({
  type: 'blockquote',
  children: [{ type: 'paragraph', children: [{ type: 'text', value: text }] }],
});

describe('remarkCallout', () => {
  it('transforms [!TYPE] blockquotes into callout elements', () => {
    const tree: Root = { type: 'root', children: [blockquote('[!WARNING]\nCareful.')] };
    remarkCallout()(tree);
    // hName/hProperties are mdast-util-to-hast's augmentation of mdast Data,
    // which this package deliberately doesn't depend on — read via a cast.
    const data = (tree.children[0] as Blockquote).data as
      | { hName?: string; hProperties?: Record<string, unknown> }
      | undefined;
    expect(data?.hName).toBe('callout');
    expect(data?.hProperties?.['data-callout-type']).toBe('WARNING');
  });

  it('leaves ordinary blockquotes alone', () => {
    const tree: Root = { type: 'root', children: [blockquote('Just a quote.')] };
    remarkCallout()(tree);
    expect((tree.children[0] as Blockquote).data).toBeUndefined();
  });
});
