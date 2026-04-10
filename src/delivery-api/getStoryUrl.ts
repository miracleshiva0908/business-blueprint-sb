import { type BridgeSearchParams } from '../BridgeSearchParams'

/**
 * Given the path and query of the current page, return the PRIMARY path to
 * fetch the story from the Storyblok Delivery API.
 *
 * The page.tsx route handler will automatically try getFallbackStoryPaths()
 * in sequence if the primary path returns a 404.
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
  // Root URL (/) → home story. In Storyblok the slug shows as '/'.
  // The API serves this story at the path 'home' (no folder prefix).
  if (slugs.length === 0) return 'home'

  // All other routes: prefix with 'pages/' per this blueprint's folder structure.
  // e.g. URL /registration → cdn/stories/pages/registration
  return ['pages', ...slugs].join('/')
}

/**
 * Returns an ordered array of fallback paths to try when the primary path 404s.
 *
 * Home (primary = 'home'):
 *   1. 'pages/home'   — in case home story is inside the pages folder
 *
 * Other pages (primary = 'pages/<slug>'):
 *   1. '<slug>'       — in case story is at root level, not inside pages folder
 */
export const getFallbackStoryPaths = (primaryPath: string): string[] => {
  // Home story: try pages/home as fallback
  if (primaryPath === 'home') {
    return ['pages/home']
  }

  // pages/slug → try bare slug at root level
  if (primaryPath.startsWith('pages/')) {
    const bare = primaryPath.slice('pages/'.length)
    return bare ? [bare] : []
  }

  return []
}

/**
 * @deprecated Use getFallbackStoryPaths (plural) instead.
 * Retained for any external callers — delegates to getFallbackStoryPaths.
 */
export const getFallbackStoryPath = (primaryPath: string): string | null =>
  getFallbackStoryPaths(primaryPath)[0] ?? null