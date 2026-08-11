import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import log from './log'
import { normalizeLocale } from './locale'
import type { Config, Deps, DownloadResult } from './types'

export const DEFAULT_API_HOST = 'https://api.yatapp.net'

const realDeps: Deps = {
  fetch: globalThis.fetch,
  mkdir,
  readFile,
  writeFile,
  rename,
  unlink,
}

export function buildUrl(
  config: Config,
  locale: string,
  apiHost: string = DEFAULT_API_HOST
): string {
  const query = new URLSearchParams({
    apiToken: config.token,
    root: String(config.root),
    strip_empty: String(config.stripEmpty),
  })

  return `${apiHost}/api/v1/project/${config.project}/${locale}/${config.format}?${query}`
}

/** Mask the token so a URL can safely appear in logs. */
export function redactUrl(url: string): string {
  try {
    const parsed = new URL(url)
    if (parsed.searchParams.has('apiToken')) {
      parsed.searchParams.set('apiToken', 'REDACTED')
    }
    return parsed.toString()
  } catch {
    return url
  }
}

async function readIfExists(
  deps: Deps,
  filePath: string
): Promise<Buffer | undefined> {
  try {
    return await deps.readFile(filePath)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined
    throw error
  }
}

export async function downloadTranslation(
  config: Config,
  locale: string,
  deps: Deps = realDeps,
  apiHost?: string
): Promise<DownloadResult> {
  const normalized = normalizeLocale(locale)
  const fileName = `${normalized}.${config.format}`
  const filePath = path.join(config.outputPath, fileName)
  const tmpPath = `${filePath}.tmp`

  await deps.mkdir(config.outputPath, { recursive: true })

  const previous = await readIfExists(deps, filePath)

  const response = await deps.fetch(buildUrl(config, locale, apiHost))

  if (!response.ok) {
    throw new Error(
      `Request failed for "${locale}". Status code: ${response.status}`
    )
  }

  const body = Buffer.from(await response.arrayBuffer())

  // Write to a tmp path first, then rename, so a failed request or write
  // never truncates an existing translation file.
  await deps.writeFile(tmpPath, body)

  try {
    await deps.rename(tmpPath, filePath)
  } catch (error) {
    await deps.unlink(tmpPath).catch(() => undefined)
    throw error
  }

  const unchanged = previous?.equals(body) ?? false

  log(
    unchanged ? 'yellow' : 'green',
    `Generating "${locale}" translation. ${unchanged ? 'Skipped.' : 'Done.'}`
  )

  return { locale: normalized, status: unchanged ? 'skipped' : 'written' }
}
