import path from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')

/** Absolute path for a repo-relative one. Every catalogue path is stored repo-relative. */
export function repoPath(...relative: string[]): string {
  return path.join(REPO_ROOT, ...relative)
}

/** Repo-relative path for an absolute one, for log lines that should read like the manifest. */
export function relativeToRepo(absolute: string): string {
  return path.relative(REPO_ROOT, absolute)
}
