import { defineConfig } from 'vitest/config'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/cli.ts',
      name: 'yata-fetch',
      formats: ['cjs'],
      fileName: 'cli',
    },
    rollupOptions: {
      external: ['node:fs', 'node:fs/promises', 'node:path', 'node:process'],
    },
  },
  test: {
    environment: 'node',
    include: ['test/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/types.ts'],
      thresholds: {
        lines: 100,
        branches: 100,
        functions: 100,
        statements: 100,
      },
    },
  },
})
