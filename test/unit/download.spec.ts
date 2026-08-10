import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildUrl, downloadTranslation, redactUrl } from '../../src/download'
import { makeFakeDeps, testConfig } from '../helpers/fakes'

const path = 'translations/en_US.yml'
const tmp = `${path}.tmp`

describe('buildUrl', () => {
  it('builds the API url with all query params', () => {
    const url = buildUrl(testConfig(), 'en_US')
    expect(url).toContain('/api/v1/project/proj/en_US/yml')
    expect(url).toContain('apiToken=secret')
    expect(url).toContain('root=false')
    expect(url).toContain('strip_empty=false')
  })

  it('honors a custom apiHost', () => {
    const url = buildUrl(testConfig(), 'en_US', 'https://example.test')
    expect(url.startsWith('https://example.test/')).toBe(true)
  })
})

describe('redactUrl', () => {
  it('masks the apiToken value', () => {
    const redacted = redactUrl(buildUrl(testConfig(), 'en_US'))
    expect(redacted).not.toContain('secret')
    expect(redacted).toContain('apiToken=REDACTED')
  })

  it('returns non-url input unchanged', () => {
    expect(redactUrl('not a url')).toBe('not a url')
  })

  it('returns a url without a token unchanged', () => {
    expect(redactUrl('https://example.test/x')).toBe('https://example.test/x')
  })
})

describe('downloadTranslation', () => {
  afterEach(() => vi.restoreAllMocks())

  it('writes a new file atomically via a tmp path', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const { deps, files, renames } = makeFakeDeps()

    const result = await downloadTranslation(testConfig(), 'en-us', deps)

    expect(result).toEqual({ locale: 'en_US', status: 'written' })
    expect(renames).toEqual([[tmp, path]])
    expect(files.get(path)).toBe('body')
  })

  it('reports skipped when content is unchanged', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { deps } = makeFakeDeps({ existing: { [path]: 'body' } })

    const result = await downloadTranslation(testConfig(), 'en_US', deps)

    expect(result.status).toBe('skipped')
    expect(spy.mock.calls.flat().join(' ')).toContain('Skipped')
  })

  it('reports written when existing content differs', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { deps } = makeFakeDeps({ existing: { [path]: 'different' } })

    const result = await downloadTranslation(testConfig(), 'en_US', deps)

    expect(result.status).toBe('written')
    expect(spy.mock.calls.flat().join(' ')).toContain('Done')
  })

  it('creates the output directory recursively', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const mkdir = vi.fn(async () => undefined)
    const { deps } = makeFakeDeps({ mkdir })

    await downloadTranslation(
      testConfig({ outputPath: 'a/b/c' }),
      'en_US',
      deps
    )

    expect(mkdir).toHaveBeenCalledWith('a/b/c', { recursive: true })
  })

  it('throws on a non-200 response without leaking the token', async () => {
    const { deps } = makeFakeDeps({
      fetch: async () => new Response('nope', { status: 404 }),
    })

    await expect(
      downloadTranslation(testConfig(), 'en_US', deps)
    ).rejects.toThrow(/404/)
    await expect(
      downloadTranslation(testConfig(), 'en_US', deps)
    ).rejects.not.toThrow(/secret/)
  })

  it('leaves an existing file intact when the request fails', async () => {
    const { deps, files } = makeFakeDeps({
      existing: { [path]: 'original' },
      fetch: async () => new Response('', { status: 500 }),
    })

    await expect(
      downloadTranslation(testConfig(), 'en_US', deps)
    ).rejects.toThrow()
    expect(files.get(path)).toBe('original')
  })

  it('propagates a network error', async () => {
    const { deps } = makeFakeDeps({
      fetch: async () => {
        throw new Error('ECONNREFUSED')
      },
    })

    await expect(
      downloadTranslation(testConfig(), 'en_US', deps)
    ).rejects.toThrow('ECONNREFUSED')
  })

  it('cleans up the tmp file when rename fails', async () => {
    const { deps, unlinked } = makeFakeDeps({
      rename: async () => {
        throw new Error('EXDEV')
      },
    })

    await expect(
      downloadTranslation(testConfig(), 'en_US', deps)
    ).rejects.toThrow('EXDEV')
    expect(unlinked).toContain(tmp)
  })

  it('ignores cleanup failure and rethrows the original error', async () => {
    const { deps } = makeFakeDeps({
      rename: async () => {
        throw new Error('EXDEV')
      },
      unlink: async () => {
        throw new Error('EACCES')
      },
    })

    await expect(
      downloadTranslation(testConfig(), 'en_US', deps)
    ).rejects.toThrow('EXDEV')
  })

  it('rethrows a non-ENOENT readFile error', async () => {
    const { deps } = makeFakeDeps({
      readFile: async () => {
        const error = new Error('EACCES') as NodeJS.ErrnoException
        error.code = 'EACCES'
        throw error
      },
    })

    await expect(
      downloadTranslation(testConfig(), 'en_US', deps)
    ).rejects.toThrow('EACCES')
  })

  it('uses the json extension when format is json', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const { deps, renames } = makeFakeDeps()

    await downloadTranslation(testConfig({ format: 'json' }), 'en_US', deps)

    expect(renames[0]?.[1]).toBe('translations/en_US.json')
  })

  it('throws on a blank locale', async () => {
    const { deps } = makeFakeDeps()
    await expect(downloadTranslation(testConfig(), '', deps)).rejects.toThrow(
      'locale'
    )
  })
})
