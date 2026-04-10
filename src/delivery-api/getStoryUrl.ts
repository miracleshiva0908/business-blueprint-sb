import { type BridgeSearchParams } from '../BridgeSearchParams'

/**
 * Given the path and query of the current page, return the path to fetch
 * the story from the Storyblok Delivery API.
 *
 * Story lookup strategy (in order of precedence):
 *  1. If the Storyblok bridge has injected an id (preview / draft mode), use that.
 *  2. For the root path (/), primary fetch is 'home'.
 *     Fallbacks: 'pages/home', then 'en/home' (see getFallbackStoryPath).
 *  3. For all other paths, primary is 'pages/<slug>'.
 *     Fallback: bare '<slug>' (root level).
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
  // Root URL (/) → home story. Storyblok convention is 'home' for root stories.
  if (slugs.length === 0) return 'home'

  // All other routes: prefix with 'pages/' per blueprint folder structure.
  return ['pages', ...slugs].join('/')
}

/**
 * Returns an ordered list of fallback paths to try when the primary path 404s.
 *
 * Home story fallback chain:
 *   'home' → 'pages/home'
 *
 * Other pages fallback chain:
 *   'pages/<slug>' → '<slug>'
 */
export const getFallbackStoryPaths = (primaryPath: string): string[] => {
  if (primaryPath === 'home') {
    // Root story: Storyblok slug shows as '/' in the UI.
    // The API may serve it as 'home' or 'pages/home' depending on space setup.
    return ['pages/home']
  }

  if (primaryPath.startsWith('pages/')) {
    const bare = primaryPath.slice('pages/'.length)
    return bare ? [bare] : []
  }

  return []
}

/**
 * @deprecated Use getFallbackStoryPaths instead.
 * Kept for backwards compatibility with page.tsx single-fallback logic.
 */
export const getFallbackStoryPath = (primaryPath: string): string | null => {
  const fallbacks = getFallbackStoryPaths(primaryPath)
  return fallbacks[0] ?? null
}