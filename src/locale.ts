/**
 * Canonicalize a locale string: lowercase language, uppercase region,
 * underscore separator. `en-us` -> `en_US`.
 */
export function normalizeLocale(locale: string): string {
  const [language, region] = locale.trim().replace(/-/g, '_').split('_')

  if (!language) {
    throw new Error(`Invalid locale: ${JSON.stringify(locale)}`)
  }

  const normalized = language.toLowerCase()

  return region ? `${normalized}_${region.toUpperCase()}` : normalized
}
