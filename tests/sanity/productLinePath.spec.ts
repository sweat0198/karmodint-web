import { describe, it, expect } from 'vitest'
import { isStudioAdmin, validateProductLinePath } from '../../sanity/schemas/objects/productLinePath'

describe('Product Line path validation', () => {
  it('accepts a Kept URL made of lowercase kebab segments wrapped in `/`', () => {
    expect(validateProductLinePath('/grp-kiosk-cabin/')).toBe(true)
    expect(validateProductLinePath('/portable-cabin/steel-cabin/')).toBe(true)
  })

  it('requires a path', () => {
    expect(validateProductLinePath(undefined)).toMatch(/required/i)
    expect(validateProductLinePath('')).toMatch(/required/i)
  })

  it('rejects a path without a leading `/`', () => {
    expect(validateProductLinePath('grp-kiosk-cabin/')).toMatch(/start and end with "\/"/)
  })

  it('rejects a path without a trailing `/`', () => {
    expect(validateProductLinePath('/grp-kiosk-cabin')).toMatch(/start and end with "\/"/)
  })

  it('rejects the site root, which is the home page', () => {
    expect(validateProductLinePath('/')).toMatch(/at least one segment/)
  })

  it('rejects uppercase segments', () => {
    expect(validateProductLinePath('/GRP-Kiosk-Cabin/')).toMatch(/"GRP-Kiosk-Cabin"/)
  })

  it.each([
    ['/grp_kiosk/', 'grp_kiosk'],
    ['/grp kiosk/', 'grp kiosk'],
    ['/-grp/', '-grp'],
    ['/grp-/', 'grp-'],
    ['/grp--kiosk/', 'grp--kiosk'],
    ['/portable-cabin//steel-cabin/', ''],
    ['/grp-kiosk-cabin/?a=1/', '?a=1']
  ])('rejects the invalid segment in %s', (path, segment) => {
    expect(validateProductLinePath(path)).toContain(`"${segment}"`)
  })

  it('rejects a path another Product Line already uses', () => {
    expect(validateProductLinePath('/grp-kiosk-cabin/', { duplicate: true })).toMatch(/already used/)
  })

  it('requires a child path to sit under its parent', () => {
    expect(
      validateProductLinePath('/portable-cabin/steel-cabin/', { parentPath: '/portable-cabin/' })
    ).toBe(true)
    expect(validateProductLinePath('/steel-cabin/', { parentPath: '/portable-cabin/' })).toMatch(
      /under its parent "\/portable-cabin\/"/
    )
    // A prefix match on characters is not enough: `/portable-cabins/` is not under `/portable-cabin/`.
    expect(validateProductLinePath('/portable-cabin-x/', { parentPath: '/portable-cabin' })).toMatch(
      /under its parent/
    )
  })

  it('rejects a child path equal to its parent path', () => {
    expect(validateProductLinePath('/portable-cabin/', { parentPath: '/portable-cabin/' })).toMatch(
      /under its parent/
    )
  })

  // The site's own pages win over the Product Line catch-all route, so such a page would never render.
  it.each(['/products/', '/solutions/site-offices/', '/studio/', '/api/x/'])(
    'rejects %s, which belongs to a page the site already serves',
    (path) => {
      expect(validateProductLinePath(path)).toMatch(/reserved/)
    }
  )
})

describe('isStudioAdmin', () => {
  it('is true only for a user holding the administrator role', () => {
    expect(isStudioAdmin({ roles: [{ name: 'administrator' }] })).toBe(true)
    expect(isStudioAdmin({ roles: [{ name: 'editor' }, { name: 'administrator' }] })).toBe(true)
    expect(isStudioAdmin({ roles: [{ name: 'editor' }] })).toBe(false)
    expect(isStudioAdmin({ roles: [] })).toBe(false)
    expect(isStudioAdmin(null)).toBe(false)
    expect(isStudioAdmin(undefined)).toBe(false)
  })
})
