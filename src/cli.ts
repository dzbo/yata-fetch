import { readFile } from 'node:fs/promises'
import log from './log'
import { loadConfig, parseArgv } from './config'
import { downloadTranslation } from './download'
import type { Deps, DownloadResult } from './types'

const DEFAULT_CONFIG_PATH = './yata.json'

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/** Counts the run's outcomes, e.g. "3 locales: 2 written, 1 skipped, 0 failed". */
function summarize(results: PromiseSettledResult<DownloadResult>[]): string {
  const outcomes = results.map(result =>
    result.status === 'fulfilled' ? result.value.status : 'failed'
  )
  const count = (outcome: (typeof outcomes)[number]) =>
    outcomes.filter(entry => entry === outcome).length
  const noun = results.length === 1 ? 'locale' : 'locales'

  return `${results.length} ${noun}: ${count('written')} written, ${count('skipped')} skipped, ${count('failed')} failed`
}

export default async function cli(
  argv: string[] = process.argv.slice(2),
  env: NodeJS.ProcessEnv = process.env,
  deps?: Deps
): Promise<number> {
  try {
    const args = parseArgv(argv)
    const configPath = args.config ?? DEFAULT_CONFIG_PATH
    const file = JSON.parse(await readFile(configPath, 'utf8')) as Record<
      string,
      unknown
    >

    const config = loadConfig({ argv: args, env, file })
    const apiHost = env.YATA_API_HOST
    const locale = args.locale
    const locales = locale ? [locale] : config.locales

    const results = await Promise.allSettled(
      locales.map(entry => downloadTranslation(config, entry, deps, apiHost))
    )

    const failures = results.filter(
      (result): result is PromiseRejectedResult => result.status === 'rejected'
    )

    for (const failure of failures) {
      log('red', describeError(failure.reason))
    }

    log(failures.length > 0 ? 'red' : 'green', summarize(results))

    process.exitCode = failures.length > 0 ? 1 : 0
    return process.exitCode
  } catch (error) {
    log('red', describeError(error))
    process.exitCode = 1
    return 1
  }
}
