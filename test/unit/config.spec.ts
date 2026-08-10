import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadConfig, parseArgv } from '../../src/config'

const base: Record<string, unknown> = {
  token: 'MY_TOKEN',
  project: 'proj',
  locales: ['en_US'],
}

const sources = (
  file: Record<string, unknown> = base,
  env: Record<string, string | undefined> = { MY_TOKEN: 'secret' },
  argv: Record<string, unknown> = {}
) => ({ argv, env, file })

describe('parseArgv', () => {
  it('parses --key value pairs', () => {
    expect(parseArgv(['--config', 'a.json'])).toEqual({ config: 'a.json' })
  })

  it('parses --key=value pairs', () => {
    expect(parseArgv(['--locale=en_US'])).toEqual({ locale: 'en_US' })
  })

  it('treats a valueless trailing flag as true', () => {
    expect(parseArgv(['--root'])).toEqual({ root: 'true' })
  })

  it('treats a flag followed by another flag as true', () => {
    expect(parseArgv(['--root', '--locale', 'en'])).toEqual({
      root: 'true',
      locale: 'en',
    })
  })

  it('ignores non-flag arguments', () => {
    expect(parseArgv(['stray', '--config', 'a.json'])).toEqual({
      config: 'a.json',
    })
  })

  it('ignores a bare -- separator', () => {
    expect(parseArgv(['--'])).toEqual({})
  })
})

describe('loadConfig', () => {
  afterEach(() => vi.restoreAllMocks())

  it('resolves the token from the named env var', () => {
    expect(loadConfig(sources()).token).toBe('secret')
  })

  it('throws when the token env var is unset', () => {
    expect(() => loadConfig(sources(base, {}))).toThrow('MY_TOKEN')
  })

  it('throws when token key is missing', () => {
    expect(() =>
      loadConfig(sources({ project: 'p', locales: ['en'] }))
    ).toThrow('token')
  })

  it('throws when token is not a string', () => {
    expect(() => loadConfig(sources({ ...base, token: 42 }))).toThrow('token')
  })

  it('throws when project is missing', () => {
    expect(() =>
      loadConfig(sources({ token: 'MY_TOKEN', locales: ['en'] }))
    ).toThrow('project')
  })

  it.each([[[]], ['en_US'], [undefined], [[1, 2]]])(
    'throws on invalid locales %j',
    locales => {
      expect(() =>
        loadConfig(sources({ token: 'MY_TOKEN', project: 'p', locales }))
      ).toThrow('locales')
    }
  )

  it('applies defaults when optional keys are absent', () => {
    const config = loadConfig(sources())
    expect(config.format).toBe('yml')
    expect(config.root).toBe(false)
    expect(config.stripEmpty).toBe(false)
    expect(config.outputPath).toBe('translations')
  })

  it('accepts all optional keys', () => {
    const config = loadConfig(
      sources({
        ...base,
        format: 'json',
        root: true,
        outputPath: 'locales',
        stripEmpty: true,
      })
    )
    expect(config).toEqual({
      token: 'secret',
      project: 'proj',
      locales: ['en_US'],
      format: 'json',
      root: true,
      outputPath: 'locales',
      stripEmpty: true,
    })
  })

  it('allows explicitly setting a boolean back to false', () => {
    const config = loadConfig(
      sources({ ...base, root: false, stripEmpty: false })
    )
    expect(config.root).toBe(false)
    expect(config.stripEmpty).toBe(false)
  })

  it('throws on an unsupported format', () => {
    expect(() => loadConfig(sources({ ...base, format: 'yaml' }))).toThrow(
      'format'
    )
  })

  it('throws on a non-boolean root', () => {
    expect(() => loadConfig(sources({ ...base, root: 'yes' }))).toThrow('root')
  })

  it('throws on a non-string outputPath', () => {
    expect(() => loadConfig(sources({ ...base, outputPath: 7 }))).toThrow(
      'outputPath'
    )
  })

  it('honors deprecated strip_empty and warns', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const config = loadConfig(sources({ ...base, strip_empty: true }))
    expect(config.stripEmpty).toBe(true)
    expect(spy.mock.calls.flat().join(' ')).toContain('strip_empty')
  })

  it('prefers stripEmpty over strip_empty without warning twice', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const config = loadConfig(
      sources({ ...base, strip_empty: false, stripEmpty: true })
    )
    expect(config.stripEmpty).toBe(true)
    expect(spy).toHaveBeenCalledOnce()
  })

  it('warns on an unknown key with a suggestion', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    loadConfig(sources({ ...base, outputpath: 'x' }))
    const output = spy.mock.calls.flat().join(' ')
    expect(output).toContain('outputpath')
    expect(output).toContain('outputPath')
  })

  it('warns on an unknown key with no close match', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    loadConfig(sources({ ...base, zzzzzz: 'x' }))
    expect(spy.mock.calls.flat().join(' ')).toContain('zzzzzz')
  })

  it('lets argv override the config file', () => {
    const config = loadConfig(
      sources(base, { MY_TOKEN: 'secret' }, { outputPath: 'from-argv' })
    )
    expect(config.outputPath).toBe('from-argv')
  })

  it('coerces argv string booleans', () => {
    const config = loadConfig(
      sources(base, { MY_TOKEN: 'secret' }, { root: 'true' })
    )
    expect(config.root).toBe(true)
  })

  it('coerces the argv string "false" to false', () => {
    const config = loadConfig(
      sources(
        { ...base, root: true },
        { MY_TOKEN: 'secret' },
        { root: 'false' }
      )
    )
    expect(config.root).toBe(false)
  })
})
