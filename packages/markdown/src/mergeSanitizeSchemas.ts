import type { SanitizeSchemaExtension } from './MarkdownContent';

/**
 * Merges attribute allowlists, concatenating per tag rather than replacing.
 *
 * A shallow spread (`{...a, ...b}`) looks like a merge but silently drops every
 * attribute the losing side allowed for a tag both sides mention — extending
 * `a` with one attribute would throw away `href`, and the links would stop
 * working. Duplicates are removed, keeping first-seen order.
 *
 * Entries may be plain names or `[name, ...allowedValues]` tuples (as in
 * rehype-sanitize's default schema), so equality is compared structurally.
 */
export function mergeAttributes<T>(
  ...sources: Array<Record<string, readonly T[]> | null | undefined>
): Record<string, T[]> {
  const merged: Record<string, T[]> = {};

  for (const source of sources) {
    if (!source) continue;

    for (const [tagName, attributes] of Object.entries(source)) {
      const combined = merged[tagName] ?? [];
      const seen = new Set(combined.map((attribute) => JSON.stringify(attribute)));

      for (const attribute of attributes) {
        const key = JSON.stringify(attribute);
        if (seen.has(key)) continue;
        seen.add(key);
        combined.push(attribute);
      }

      merged[tagName] = combined;
    }
  }

  return merged;
}

/**
 * Merges multiple sanitize schema extensions into one.
 */
export function mergeSanitizeSchemas(
  ...schemas: SanitizeSchemaExtension[]
): SanitizeSchemaExtension {
  return {
    tagNames: [...new Set(schemas.flatMap((s) => s.tagNames ?? []))],
    attributes: mergeAttributes(...schemas.map((s) => s.attributes)),
  };
}
