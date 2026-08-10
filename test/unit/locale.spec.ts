import { describe, expect, it } from 'vitest'
import { normalizeLocale } from '../../src/locale'

describe('normalizeLocale', () => {
  it.each([
    ['en-us', 'en_US'],
    ['en_US', 'en_US'],
    ['EN', 'en'],
    ['en', 'en'],
    ['pt-BR', 'pt_BR'],
    ['ZH_hans', 'zh_HANS'],
  ])('normalizes %s to %s', (input, expected) => {
    expect(normalizeLocale(input)).toBe(expected)
  })

  it('ignores a third segment', () => {
    expect(normalizeLocale('en-us-posix')).toBe('en_US')
  })

  it.each(['', '   ', '_', '-'])('throws on blank input %j', input => {
    expect(() => normalizeLocale(input)).toThrow('locale')
  })
})
