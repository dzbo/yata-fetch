import type { Config, Deps } from '../../src/types'

export const testConfig = (overrides: Partial<Config> = {}): Config => ({
  token: 'secret',
  project: 'proj',
  locales: ['en_US'],
  format: 'yml',
  root: false,
  outputPath: 'translations',
  stripEmpty: false,
  ...overrides,
})

export function makeFakeDeps(
  overrides: Partial<Deps> & { existing?: Record<string, string> } = {}
) {
  const { existing = {}, ...depOverrides } = overrides
  const files = new Map<string, string>(Object.entries(existing))
  const renames: Array<[string, string]> = []
  const unlinked: string[] = []

  const deps: Deps = {
    fetch: async () => new Response('body', { status: 200 }),
    mkdir: async () => undefined,
    readFile: async path => {
      const content = files.get(path)
      if (content === undefined) {
        const error = new Error(`ENOENT: ${path}`) as NodeJS.ErrnoException
        error.code = 'ENOENT'
        throw error
      }
      return Buffer.from(content)
    },
    writeFile: async (path, data) => {
      files.set(path, Buffer.from(data).toString())
    },
    rename: async (from, to) => {
      renames.push([from, to])
      const content = files.get(from)
      if (content !== undefined) {
        files.set(to, content)
        files.delete(from)
      }
    },
    unlink: async path => {
      unlinked.push(path)
      files.delete(path)
    },
    ...depOverrides,
  }

  return { deps, files, renames, unlinked }
}
