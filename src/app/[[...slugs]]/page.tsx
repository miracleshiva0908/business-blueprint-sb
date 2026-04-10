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
 * Fetch a single story path. Returns null on 404, throws on all other errors.
 */
const fetchStory = async (path: string, options: ISbStoriesParams) => {
  const client = getStoryblokApi()
  try {
    const result = await client
      .get(`cdn/stories/${path}`, options)
      .then((r) => r.data)
    console.info(`[story] ✓ Found story at path: '${path}'`)
    return result
  } catch (err: unknown) {
    const apiErr = err as StoryblokApiError
    if (apiErr?.status === 404) {
      console.info(`[story] ✗ 404 at path: '${path}'`)
      return null
    }
    throw new Error(
      `[story] Error fetching '${path}': ${apiErr?.status ?? 'unknown'} ${apiErr?.message ?? ''}`,
    )
  }
}

/**
 * Walk through primary path then all fallbacks until a story is found.
 * If all paths fail, calls Next.js notFound() to render the 404 page.
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

  console.info(`[story] Resolving slugs: [${slugs.join(', ') || '/'}] → trying paths: [${allPaths.join(', ')}]`)

  for (const path of allPaths) {
    const result = await fetchStory(path, fetchOptions)
    if (result !== null) return result
  }

  console.info(`[story] All paths exhausted for slugs: [${slugs.join(', ') || '/'}] → rendering 404`)
  notFound()
}

export default async function DynamicPage(props: DynamicPageProps) {
  const paramsResult = parseParams(await props.params)

  if (paramsResult.error) {
    throw new Error(
      `Failed to parse params: ${formatResult(paramsResult)}`,
    )
  }

  const bridgeSearchParams = parseBridgeSearchParams(await props.searchParams)
  const { story } = await getStory(paramsResult.value.slugs, bridgeSearchParams)

  return (
    <StoryblokStory
      story={story}
      bridgeOptions={{ resolveRelations }}
    />
  )
}