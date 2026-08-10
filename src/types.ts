export type Format = 'yml' | 'json'

export interface Config {
  token: string
  project: string
  locales: string[]
  format: Format
  root: boolean
  outputPath: string
  stripEmpty: boolean
}

export interface Deps {
  fetch: typeof globalThis.fetch
  mkdir(path: string, opts: { recursive: true }): Promise<unknown>
  readFile(path: string): Promise<Buffer>
  writeFile(path: string, data: Uint8Array): Promise<void>
  rename(from: string, to: string): Promise<void>
  unlink(path: string): Promise<void>
}

export type DownloadResult = {
  locale: string
  status: 'written' | 'skipped'
}
