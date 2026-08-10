import { readFile } from 'node:fs/promises'
import log from './log'
import { loadConfig, parseArgv } from './config'
import { downloadTranslation } from './download'
import type { Deps } from './types'

const DEFAULT_CONFIG_PATH = './yata.json'

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export default async function cli(
  argv: string[] = process.argv.slice(2),
  env: NodeJS.ProcessEnv = process.env,
  deps?: Deps
): Promise<number> {
  try {
    const args = parseArgv(argv)
    const configPath = args['config'] ?? DEFAULT_CONFIG_PATH
    const file = JSON.parse(await readFile(configPath, 'utf8')) as Record<
      string,
      unknown
    >

    const config = loadConfig({ argv: args, env, file })
    const apiHost = env['YATA_API_HOST']
    const locale = args['locale']
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

    process.exitCode = failures.length > 0 ? 1 : 0
    return process.exitCode
  } catch (error) {
    log('red', describeError(error))
    process.exitCode = 1
    return 1
  }
}
