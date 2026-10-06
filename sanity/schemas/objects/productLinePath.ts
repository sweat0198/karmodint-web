/**
 * The rules a Product Line `path` (a Kept URL) is held to, as plain functions.
 *
 * Deliberately no `sanity` import, for the same reason as `blockContentSpec.ts`: the Product Line
 * seed script runs from the repo root, where the Studio package is not resolvable, and it checks
 * its own data against these exact rules before anything reaches the dataset.
 */

/** One URL segment: lowercase letters and digits, single hyphens between them. */
const SEGMENT_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * First segments owned by the site's own pages (and the Studio and API).
 *
 * Nuxt matches those routes before the Product Line catch-all, so a Product Line at one of these
 * paths would be saved happily and never render.
 */
export const RESERVED_FIRST_SEGMENTS = [
  'about',
  'api',
  'contact',
  'customize',
  'gallery',
  'privacy-policy',
  'products',
  'quote',
  'solutions',
  'studio'
] as const

export interface ProductLinePathContext {
  /** The parent Product Line's path, when a parent is set. */
  parentPath?: string | null
  /** Whether another Product Line already uses this path. */
  duplicate?: boolean
}

function asDirectory(path: string): string {
  return path.endsWith('/') ? path : `${path}/`
}

/**
 * `true`, or the first problem with `path` as a message an editor can act on.
 *
 * Every Product Line path starts and ends with `/` (ADR-003), is lowercase kebab segments, is
 * unique, and sits strictly under its parent's path when there is a parent.
 */
export function validateProductLinePath(
  path: string | undefined,
  context: ProductLinePathContext = {}
): true | string {
  if (!path) return 'A path is required'

  if (!path.startsWith('/') || !path.endsWith('/')) {
    return 'The path must start and end with "/", e.g. "/portable-cabin/steel-cabin/"'
  }

  if (path === '/') return 'The path needs at least one segment; "/" is the home page'

  const segments = path.slice(1, -1).split('/')
  const invalid = segments.find((segment) => !SEGMENT_PATTERN.test(segment))
  if (invalid !== undefined) {
    return `Segment "${invalid}" is invalid: use lowercase letters, digits and single hyphens`
  }

  if ((RESERVED_FIRST_SEGMENTS as readonly string[]).includes(segments[0])) {
    return `"/${segments[0]}/" is reserved for a page the site already serves`
  }

  if (context.parentPath) {
    const parentDirectory = asDirectory(context.parentPath)
    if (!path.startsWith(parentDirectory) || path === parentDirectory) {
      return `The path must sit under its parent "${parentDirectory}", e.g. "${parentDirectory}your-page/"`
    }
  }

  if (context.duplicate) return `The path "${path}" is already used by another Product Line`

  return true
}

export interface StudioUser {
  roles: Array<{ name: string }>
}

/** Whether the signed-in Studio user may edit admin-only fields. */
export function isStudioAdmin(user: StudioUser | null | undefined): boolean {
  return Boolean(user?.roles.some((role) => role.name === 'administrator'))
}
