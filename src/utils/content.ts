/**
 * Check if content should be visible based on draft status and environment
 *
 * In production, only published (non-draft) content is visible.
 * In development, all content including drafts is visible.
 *
 * @param entry - Collection entry with isDraft field
 * @returns true if content should be visible
 *
 * @example
 * // Use with getCollection filter
 * const notes = await getCollection("notes", isPublished);
 *
 * @example
 * // Use with array filter
 * const published = allEntries.filter(isPublished);
 */
export function isPublished<T extends { data: { isDraft?: boolean } }>(entry: T): boolean {
  return import.meta.env.PROD ? entry.data.isDraft !== true : true;
}
