import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [vue()],
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
      // Mirrors Nuxt's own aliasing: `~`/`@` resolve into the `app/` srcDir, `~~`/`@@` resolve
      // to the repo root. A prior version pointed all four at the repo root, which happened to
      // work only because every test so far imported non-Vue files via `~~/app/...`.
      '~': path.join(currentDir, 'app'),
      '@': path.join(currentDir, 'app'),
      '~~': currentDir,
      '@@': currentDir
    }
  }
})
