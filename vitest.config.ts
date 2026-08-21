import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: {
    // No test needs a browser DOM: these cover schemas, GROQ, server handlers and the catalogue
    // import, none of which touch `window`. A global DOM environment cost ~30s of setup per run
    // for nothing. A component test can opt back in per file with a docblock:
    //
    //   // @vitest-environment jsdom
    //
    // jsdom, not happy-dom — the catalogue import parses HTML through `@portabletext/block-tools`,
    // which needs XPath that happy-dom does not implement, so jsdom is a dependency regardless.
    environment: 'node',
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
