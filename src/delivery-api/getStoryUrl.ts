import { type BridgeSearchParams } from '../BridgeSearchParams'

/**
 * Given the path and query of the current page, return the path to fetch
 * the story from the Storyblok Delivery API.
 *
 * Story lookup strategy (in order of precedence):
 *  1. If the Storyblok bridge has injected an id (preview / draft mode), use that.
 *  2. Try the slug prefixed with "pages/" — e.g. "pages/registration".
 *     This matches the default blueprint folder structure.
 *  3. If the API returns 404 for the prefixed path, fall back to the bare slug
 *     — e.g. "registration". This covers stories created at the root level.
 *
 * @param slugs            Array of URL path segments for the current page.
 * @param bridgeSearchParams Parsed Storyblok bridge / preview query params.
 */
export const getStoryPath = (
  slugs: string[],
  bridgeSearchParams: BridgeSearchParams,
): string => {
  // ── Preview / draft mode: use the story id injected by the bridge ──────────
  const id =
    bridgeSearchParams.version === 'draft'
      ? bridgeSearchParams._storyblok
      : bridgeSearchParams._storyblok_published

  if (id) return id

  // ── Published mode: derive path from URL slugs ─────────────────────────────
  // Empty slugs = home page
  if (slugs.length === 0) return 'pages/home'

  // Default: stories live inside the "pages" folder in Storyblok.
  // e.g. URL /registration → cdn/stories/pages/registration
  return ['pages', ...slugs].join('/')
}

/**
 * Fallback path used when `getStoryPath` returns a "pages/…" path but the
 * Storyblok API responds with a 404.
 *
 * Returns the bare slug (without the "pages/" prefix) so callers can retry
 * against the root of the Storyblok content tree.
 *
 * Returns `null` if the path doesn't start with "pages/" (no fallback needed).
 */
export const getFallbackStoryPath = (primaryPath: string): string | null => {
  if (primaryPath.startsWith('pages/')) {
    return primaryPath.slice('pages/'.length) || null
  }
  return null
}