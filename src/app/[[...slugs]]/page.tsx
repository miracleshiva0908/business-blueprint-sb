import { getStoryPath, getFallbackStoryPath } from '@/delivery-api'
import {
  BridgeSearchParams,
  parseBridgeSearchParams,
} from '@/BridgeSearchParams'
import {
  array,
  formatResult,
  object,
  parseString,
  withDefault,
} from 'pure-parse'
import { notFound } from 'next/navigation'
import { getStoryblokApi } from '@/lib/storyblok'
import { StoryblokStory } from '@storyblok/react/rsc'

const resolveRelations = ['teamMembers.teamMembers']

type DynamicPageProps = {
  params: Promise<unknown>
  searchParams: Promise<unknown>
}

const parseParams = object<{ slugs: string[] }>({
  slugs: withDefault(array(parseString), []),
})

/**
 * Fetch a story from the Storyblok Delivery API.
 *
 * Automatically retries with a fallback path when the primary path (prefixed
 * with "pages/") returns a 404, allowing stories to live either inside the
 * "pages" folder OR at the root of the Storyblok content tree.
 *
 * @throws notFound() when neither path resolves to a story.
 * @throws Error for non-404 API failures.
 */
const getStory = async (
  slugs: string[],
  bridgeSearchParams: BridgeSearchParams,
) => {
  const client = getStoryblokApi()

  const fetchOptions = {
    resolve_relations: resolveRelations,
    version: bridgeSearchParams.version,
    language:
      bridgeSearchParams.version === 'draft'
        ? bridgeSearchParams._storyblok_lang
        : 'default',
  }

  const primaryPath = getStoryPath(slugs, bridgeSearchParams)

  // ── Primary fetch ────────────────────────────────────────────────────────
  try {
    const result = await client
      .get(`cdn/stories/${primaryPath}`, fetchOptions)
      .then((r) => r.data)
    return result
  } catch (primaryError: unknown) {
    const err = primaryError as { status?: number; message?: string }

    // If it's not a 404, surface the error immediately — don't retry.
    if (err?.status !== 404) {
      throw new Error(
        `Failed to fetch story: ${err?.status ?? 'unknown'} ${err?.message ?? ''}`,
      )
    }

    // ── Fallback fetch (bare slug, no "pages/" prefix) ───────────────────
    const fallbackPath = getFallbackStoryPath(primaryPath)

    if (!fallbackPath) {
      // No fallback available — render the 404 page.
      notFound()
    }

    try {
      const fallbackResult = await client
        .get(`cdn/stories/${fallbackPath}`, fetchOptions)
        .then((r) => r.data)
      return fallbackResult
    } catch (fallbackError: unknown) {
      // Both paths failed — show 404.
      notFound()
    }
  }
}

export default async function DynamicPage(props: DynamicPageProps) {
  const paramsResult = parseParams(await props.params)

  if (paramsResult.error) {
    throw new Error(
      `Failed to parse params: the folders in the app directory are likely misconfigured ${formatResult(paramsResult)}`,
    )
  }

  const bridgeSearchParams = parseBridgeSearchParams(await props.searchParams)

  const { story } = await getStory(paramsResult.value.slugs, bridgeSearchParams)

  return (
    <StoryblokStory
      story={story}
      bridgeOptions={{
        resolveRelations,
      }}
    />
  )
}