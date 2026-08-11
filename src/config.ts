import log from './log'
import type { Config, Format } from './types'

const FORMATS: readonly Format[] = ['yml', 'json']

/** Keys valid in the JSON config file. */
export const KNOWN_KEYS = [
  'token',
  'project',
  'locales',
  'format',
  'root',
  'outputPath',
  'stripEmpty',
] as const

/**
 * CLI-only flags. Valid on argv but meaningless in the config file, so a
 * config file containing one gets an unknown-key warning — it would
 * otherwise be silently ignored.
 */
const CLI_ONLY_KEYS = ['config', 'locale'] as const

const DEPRECATED: Record<string, string> = { strip_empty: 'stripEmpty' }

export interface RawSources {
  argv: Record<string, unknown>
  env: Record<string, string | undefined>
  file: Record<string, unknown>
}

/** Parse `--key value` and `--key=value`. A valueless flag becomes 'true'. */
export function parseArgv(argv: string[]): Record<string, string> {
  const parsed: Record<string, string> = {}

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (!arg?.startsWith('--')) continue

    const [key, inlineValue] = arg.slice(2).split('=')
    if (!key) continue

    if (inlineValue !== undefined) {
      parsed[key] = inlineValue
      continue
    }

    const next = argv[i + 1]
    if (next !== undefined && !next.startsWith('--')) {
      parsed[key] = next
      i++
    } else {
      parsed[key] = 'true'
    }
  }

  return parsed
}

/**
 * Levenshtein distance, used only for "did you mean" suggestions.
 *
 * Rolls a single row forward instead of building a full matrix. The non-null
 * assertions are deliberate: the loop bounds guarantee every index is in
 * range, and `noUncheckedIndexedAccess` would otherwise force `??` fallbacks
 * that are provably unreachable and so break the 100% branch threshold.
 */
function distance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, j) => j)

  for (let i = 1; i <= a.length; i++) {
    const current = [i]

    for (let j = 1; j <= b.length; j++) {
      const cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1
      current.push(
        Math.min(previous[j]! + 1, current[j - 1]! + 1, previous[j - 1]! + cost)
      )
    }

    previous = current
  }

  return previous[b.length]!
}

function warnUnknownKeys(file: Record<string, unknown>): void {
  for (const key of Object.keys(file)) {
    if (KNOWN_KEYS.includes(key as (typeof KNOWN_KEYS)[number])) continue
    if (key in DEPRECATED) continue

    if (CLI_ONLY_KEYS.includes(key as (typeof CLI_ONLY_KEYS)[number])) {
      log(
        'yellow',
        `⚠ \`${key}\` is a CLI flag, not a config key — it is ignored here. Pass \`--${key}\` instead.`
      )
      continue
    }

    const suggestion = KNOWN_KEYS.map(known => ({
      known,
      d: distance(key.toLowerCase(), known.toLowerCase()),
    }))
      .sort((a, b) => a.d - b.d)
      .find(candidate => candidate.d <= 3)

    log(
      'yellow',
      suggestion
        ? `⚠ Unknown config key \`${key}\` — did you mean \`${suggestion.known}\`?`
        : `⚠ Unknown config key \`${key}\``
    )
  }
}

function asBoolean(value: unknown, key: string): boolean {
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false
  throw new Error(`Config \`${key}\` must be a boolean, got ${typeof value}`)
}

export function loadConfig(sources: RawSources): Config {
  const { argv, env, file } = sources

  warnUnknownKeys(file)

  if ('strip_empty' in file) {
    log(
      'yellow',
      '⚠ `strip_empty` is deprecated, use `stripEmpty` (support ends in v4)'
    )
  }

  const pick = (key: string): unknown =>
    key in argv ? argv[key] : (file[key] ?? undefined)

  const tokenName = pick('token')
  if (typeof tokenName !== 'string' || !tokenName) {
    throw new Error('No `token` in config file')
  }

  const token = env[tokenName]
  if (!token) {
    throw new Error(`No \`${tokenName}\` in ENV`)
  }

  const project = pick('project')
  if (typeof project !== 'string' || !project) {
    throw new Error('No `project` in config file')
  }

  const locales = pick('locales')
  if (
    !Array.isArray(locales) ||
    locales.length === 0 ||
    !locales.every(locale => typeof locale === 'string')
  ) {
    throw new Error('No `locales` in config file')
  }

  const rawFormat = pick('format') ?? 'yml'
  if (!FORMATS.includes(rawFormat as Format)) {
    throw new Error(
      `Config \`format\` must be one of ${FORMATS.join(', ')}, got ${String(
        rawFormat
      )}`
    )
  }

  const outputPath = pick('outputPath') ?? 'translations'
  if (typeof outputPath !== 'string') {
    throw new Error('Config `outputPath` must be a string')
  }

  const stripEmptyRaw =
    'stripEmpty' in argv || 'stripEmpty' in file
      ? pick('stripEmpty')
      : (file.strip_empty ?? false)

  return {
    token,
    project,
    locales,
    format: rawFormat as Format,
    root: asBoolean(pick('root') ?? false, 'root'),
    outputPath,
    stripEmpty: asBoolean(stripEmptyRaw, 'stripEmpty'),
  }
}
