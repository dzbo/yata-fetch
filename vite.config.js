import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/cli.ts',
      name: 'yata-fetch',
      formats: ['cjs'],
      fileName: 'cli',
    },
    rollupOptions: {
      external: [
        'util',
        'fs',
        'path',
        'https',
        'http',
        'stream',
        'events',
        'buffer',
        'os',
        'crypto',
      ],
    },
  },
  test: {
    environment: 'node',
  },
})
