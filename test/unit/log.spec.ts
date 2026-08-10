import { afterEach, describe, expect, it, vi } from 'vitest'
import log, { type Color } from '../../src/log'

describe('log', () => {
  afterEach(() => vi.restoreAllMocks())

  it.each([
    ['red', '\x1b[31m'],
    ['green', '\x1b[32m'],
    ['yellow', '\x1b[33m'],
  ] as const)('prefixes %s with its ANSI code', (color, code) => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log(color, 'hello')
    expect(spy).toHaveBeenCalledWith(`${code}%s\x1b[0m`, 'hello')
  })

  it('falls back to white for an unknown color', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log('chartreuse' as Color, 'hi')
    expect(spy).toHaveBeenCalledWith('\x1b[37m%s\x1b[0m', 'hi')
  })
})
