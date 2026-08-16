import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    testTimeout: 15000,
    include: ['tests/**/*.{test,spec}.ts']
  },
  resolve: {
    alias: {
      '~': currentDir,
      '@': currentDir,
      '~~': currentDir,
      '@@': currentDir
    }
  }
})
