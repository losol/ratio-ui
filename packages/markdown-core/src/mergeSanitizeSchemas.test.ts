import { describe, it, expect } from 'vitest';
import { mergeSanitizeSchemas } from './mergeSanitizeSchemas';

describe('mergeSanitizeSchemas', () => {
  it('concatenates per-tag attribute allowlists instead of clobbering', () => {
    const merged = mergeSanitizeSchemas(
      { tagNames: ['callout'], attributes: { callout: ['data-callout-type'] } },
      { tagNames: ['callout'], attributes: { callout: ['data-level'] } }
    );
    expect(merged.attributes?.callout).toEqual(['data-callout-type', 'data-level']);
    expect(merged.tagNames).toEqual(['callout']);
  });
});
