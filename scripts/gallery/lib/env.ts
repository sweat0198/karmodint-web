import fs from 'node:fs'
import { repoPath } from './paths'

/**
 * Parse one `KEY=value` line, or `null` for a blank or comment line.
 *
 * Preserves quotes when enclosed, strips inline comments if separated by whitespace.
 */
export function parseEnvLine(line: string): { key: string, value: string } | null {
  const match = line.match(/^\s*(?:export\s+)?([\w.-]+)\s*=\s*(.*)$/)
  if (!match) return null

  const [, key, rest] = match
  const quote = rest[0]

  if (quote === '"' || quote === "'") {
    const closing = rest.indexOf(quote, 1)
    return { key, value: closing === -1 ? rest.slice(1) : rest.slice(1, closing) }
  }

  return { key, value: rest.replace(/\s+#.*$/, '').trim() }
}

/**
 * Load repo-root `.env` into `process.env`.
 * Pre-existing environment variables take precedence so CLI/shell overrides work.
 */
export function loadRootEnv(envPath: string = repoPath('.env')): void {
  if (!fs.existsSync(envPath)) return

  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const parsed = parseEnvLine(line)
    if (parsed && process.env[parsed.key] === undefined) {
      process.env[parsed.key] = parsed.value
    }
  }
}
