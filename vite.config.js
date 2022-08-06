import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/cli.ts',
      name: 'yata-fetch',
      formats: ['cjs'],
      fileName: 'cli',
    },
  },
  test: {
    environment: 'node',
  },
})
