import { getStoryPath, getFallbackStoryPaths } from '@/delivery-api'
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
import type { ISbStoriesParams } from '@storyblok/react/rsc'

const resolveRelations = ['teamMembers.teamMembers']

type DynamicPageProps = {
  params: Promise<unknown>
  searchParams: Promise<unknown>
}

const parseParams = object<{ slugs: string[] }>({
  slugs: withDefault(array(parseString), []),
})

type StoryblokApiError = { status?: number; message?: string }

/**
 * Fetch a single story path from the Storyblok Delivery API.
 * Returns null on 404, throws on all other errors.
 */
const fetchStory = async (
  path: string,
  options: ISbStoriesParams,
) => {
  const client = getStoryblokApi()
  try {
    const result = await client
      .get(`cdn/stories/${path}`, options)
      .then((r) => r.data)
    return result
  } catch (err: unknown) {
    const apiErr = err as StoryblokApiError
    if (apiErr?.status === 404) return null
    throw new Error(
      `Failed to fetch story at '${path}': ${apiErr?.status ?? 'unknown'} ${apiErr?.message ?? ''}`,
    )
  }
}

/**
 * Fetch a story, automatically walking through fallback paths on 404.
 *
 * Path resolution order for '/' (home):
 *   1. 'home'
 *   2. 'pages/home'
 *
 * Path resolution order for '/registration':
 *   1. 'pages/registration'
 *   2. 'registration'
 *
 * Calls notFound() if all paths are exhausted.
 */
const getStory = async (
  slugs: string[],
  bridgeSearchParams: BridgeSearchParams,
) => {
  const fetchOptions: ISbStoriesParams = {
    resolve_relations: resolveRelations,
    version: bridgeSearchParams.version,
    language:
      bridgeSearchParams.version === 'draft'
        ? bridgeSearchParams._storyblok_lang
        : 'default',
  }

  const primaryPath = getStoryPath(slugs, bridgeSearchParams)
  const allPaths = [primaryPath, ...getFallbackStoryPaths(primaryPath)]

  for (const path of allPaths) {
    const result = await fetchStory(path, fetchOptions)
    if (result !== null) return result
  }

  // All paths exhausted — show 404 page
  notFound()
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