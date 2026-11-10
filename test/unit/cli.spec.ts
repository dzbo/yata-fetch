import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import cli from '../../src/cli'
import { makeFakeDeps } from '../helpers/fakes'

const configFile = 'test/fixtures/yata.json'
const env = { YATA_DEV_TOKEN: 'secret' } as NodeJS.ProcessEnv

describe('cli', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    process.exitCode = undefined
  })

  afterEach(() => {
    vi.restoreAllMocks()
    process.exitCode = undefined
  })

  it('downloads every locale from the config file and exits 0', async () => {
    const { deps, renames } = makeFakeDeps()

    const code = await cli(['--config', configFile], env, deps)

    expect(code).toBe(0)
    expect(process.exitCode).toBe(0)
    expect(renames).toHaveLength(2)
  })

  it('downloads only the requested locale when --locale is passed', async () => {
    const { deps, renames } = makeFakeDeps()

    const code = await cli(
      ['--config', configFile, '--locale', 'en_US'],
      env,
      deps
    )

    expect(code).toBe(0)
    expect(renames).toHaveLength(1)
    expect(renames[0]?.[1]).toContain('en_US')
  })

  it('exits 1 and reports when a download fails', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { deps } = makeFakeDeps({
      fetch: async () => new Response('', { status: 500 }),
    })

    const code = await cli(['--config', configFile], env, deps)

    expect(code).toBe(1)
    expect(process.exitCode).toBe(1)
    expect(spy.mock.calls.flat().join(' ')).toContain('500')
  })

  it('exits 1 when the config file is missing', async () => {
    const { deps } = makeFakeDeps()

    const code = await cli(['--config', 'does/not/exist.json'], env, deps)

    expect(code).toBe(1)
  })

  it('exits 1 when the token env var is unset', async () => {
    const { deps } = makeFakeDeps()

    const code = await cli(['--config', configFile], {}, deps)

    expect(code).toBe(1)
  })

  it('reports a non-Error rejection', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { deps } = makeFakeDeps({
      fetch: async () => {
        throw 'plain string failure'
      },
    })

    const code = await cli(['--config', configFile], env, deps)

    expect(code).toBe(1)
    expect(spy.mock.calls.flat().join(' ')).toContain('plain string failure')
  })

  it('honors YATA_API_HOST from the environment', async () => {
    const fetchSpy = vi.fn(
      async (url: string | URL | Request) =>
        new Response(String(url), { status: 200 })
    )
    const { deps } = makeFakeDeps({ fetch: fetchSpy })

    await cli(
      ['--config', configFile, '--locale', 'en_US'],
      { ...env, YATA_API_HOST: 'https://example.test' },
      deps
    )

    expect(String(fetchSpy.mock.calls[0]?.[0])).toContain('example.test')
  })

  it('defaults to the standard config path when none is given', async () => {
    const { deps } = makeFakeDeps()
    const code = await cli([], env, deps)
    expect(code).toBe(1)
  })

  it('defaults to process.argv and process.env', async () => {
    const code = await cli(undefined, {}, makeFakeDeps().deps)
    expect(code).toBe(1)
  })

  it('continues past one failure and reports all of them', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    let call = 0
    const { deps } = makeFakeDeps({
      fetch: async () => {
        call++
        return new Response('', { status: call === 1 ? 500 : 503 })
      },
    })

    const code = await cli(['--config', configFile], env, deps)

    expect(code).toBe(1)
    const output = spy.mock.calls.flat().join(' ')
    expect(output).toContain('500')
    expect(output).toContain('503')
  })

  it('prints a green summary when nothing failed', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { deps } = makeFakeDeps({
      existing: { 'translations/pl_PL.yml': 'body' },
    })

    await cli(['--config', configFile], env, deps)

    expect(spy).toHaveBeenLastCalledWith(
      '\x1b[32m%s\x1b[0m',
      '2 locales: 1 written, 1 skipped, 0 failed'
    )
  })

  it('prints a red summary when a download failed', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    let call = 0
    const { deps } = makeFakeDeps({
      fetch: async () => {
        call++
        return new Response('body', { status: call === 1 ? 500 : 200 })
      },
    })

    await cli(['--config', configFile], env, deps)

    expect(spy).toHaveBeenLastCalledWith(
      '\x1b[31m%s\x1b[0m',
      '2 locales: 1 written, 0 skipped, 1 failed'
    )
  })

  it('uses the singular for a single locale', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { deps } = makeFakeDeps()

    await cli(['--config', configFile, '--locale', 'en_US'], env, deps)

    expect(spy).toHaveBeenLastCalledWith(
      '\x1b[32m%s\x1b[0m',
      '1 locale: 1 written, 0 skipped, 0 failed'
    )
  })
})
