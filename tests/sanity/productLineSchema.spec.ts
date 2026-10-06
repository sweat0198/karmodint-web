import { describe, it, expect } from 'vitest'
import { schemaTypes } from '../../sanity/schemas'
import { checkProductLinePath, productLineType } from '../../sanity/schemas/productLine'
import { faqItem } from '../../sanity/schemas/objects/faqItem'

function fieldsOf(type: { fields: unknown[] }): Record<string, any> {
  return Object.fromEntries(type.fields.map((field: any) => [field.name, field]))
}

/**
 * A stand-in for Studio's validation context: one dataset of Product Line documents, read the way
 * the validator reads it.
 */
function contextFor(document: Record<string, any>, dataset: Array<Record<string, any>>) {
  return {
    document,
    getClient: () => ({
      withConfig: () => ({
        fetch: async (_query: string, params: { parentId?: string; path?: string; id?: string }) => {
          const parent = dataset.find((doc) => doc._id === params.parentId)
          const baseId = (params.id ?? '').replace(/^drafts\./, '')
          const duplicate = dataset.some(
            (doc) =>
              doc.path === params.path && doc._id !== baseId && doc._id !== `drafts.${baseId}`
          )
          return { parentPath: parent?.path ?? null, duplicate }
        }
      })
    })
  }
}

const portableCabin = { _id: 'productLine-portable-cabin', path: '/portable-cabin/' }
const grp = { _id: 'productLine-grp-kiosk-cabin', path: '/grp-kiosk-cabin/' }

describe('Product Line schema', () => {
  it('registers the productLine document and the shared faqItem object', () => {
    const typeNames = schemaTypes.map((type: any) => type.name)
    expect(typeNames).toContain('productLine')
    expect(typeNames).toContain('faqItem')
  })

  it('defines the agreed fields', () => {
    const fields = fieldsOf(productLineType)

    expect(Object.keys(fields)).toEqual([
      'name',
      'path',
      'parent',
      'category',
      'description',
      'coverImage',
      'body',
      'faqs',
      'displayOrder',
      'seo'
    ])
    expect(fields.name.type).toBe('string')
    expect(fields.path.type).toBe('string')
    expect(fields.parent.type).toBe('reference')
    expect(fields.parent.to).toEqual([{ type: 'productLine' }])
    expect(fields.category.type).toBe('reference')
    expect(fields.category.to).toEqual([{ type: 'category' }])
    expect(fields.description.type).toBe('text')
    expect(fields.coverImage.type).toBe('image')
    expect(fields.coverImage.fields.map((field: any) => field.name)).toEqual(['alt'])
    expect(fields.body.type).toBe('blockContent')
    expect(fields.faqs.type).toBe('array')
    expect(fields.faqs.of.map((member: any) => member.type)).toEqual(['faqItem'])
    expect(fields.displayOrder.type).toBe('number')
    expect(fields.seo.type).toBe('seo')
  })

  it('lets only a Studio admin edit the path', () => {
    const { readOnly } = fieldsOf(productLineType).path

    expect(readOnly({ currentUser: { roles: [{ name: 'administrator' }] } })).toBe(false)
    expect(readOnly({ currentUser: { roles: [{ name: 'editor' }] } })).toBe(true)
    expect(readOnly({ currentUser: null })).toBe(true)
  })

  it('shapes a FAQ entry as a question and a formatted answer', () => {
    const fields = fieldsOf(faqItem)
    expect(Object.keys(fields)).toEqual(['question', 'answer'])
    expect(fields.question.type).toBe('string')
    expect(fields.answer.type).toBe('array')
    expect(fields.answer.of.map((member: any) => member.type)).toEqual(['block'])
  })
})

describe('checkProductLinePath', () => {
  it('accepts a top-level path no other Product Line uses', async () => {
    const document = { _id: 'drafts.productLine-panel-cabin', path: '/panel-cabin/' }
    expect(await checkProductLinePath('/panel-cabin/', contextFor(document, [grp]))).toBe(true)
  })

  it('rejects a path another Product Line already uses', async () => {
    const document = { _id: 'drafts.productLine-copy', path: '/grp-kiosk-cabin/' }
    expect(await checkProductLinePath('/grp-kiosk-cabin/', contextFor(document, [grp]))).toMatch(
      /already used/
    )
  })

  it('does not count the document’s own published version as a duplicate', async () => {
    const document = { _id: 'drafts.productLine-grp-kiosk-cabin', path: '/grp-kiosk-cabin/' }
    expect(await checkProductLinePath('/grp-kiosk-cabin/', contextFor(document, [grp]))).toBe(true)
  })

  it('requires a child path to sit under the parent’s path', async () => {
    const parent = { _type: 'reference', _ref: portableCabin._id }
    const dataset = [portableCabin]

    expect(
      await checkProductLinePath(
        '/portable-cabin/steel-cabin/',
        contextFor({ _id: 'productLine-steel-cabin', parent }, dataset)
      )
    ).toBe(true)
    expect(
      await checkProductLinePath(
        '/steel-cabin/',
        contextFor({ _id: 'productLine-steel-cabin', parent }, dataset)
      )
    ).toMatch(/under its parent/)
  })

  it('rejects a malformed path before asking the dataset anything', async () => {
    const context = {
      document: { _id: 'productLine-x' },
      getClient: () => {
        throw new Error('should not be called')
      }
    }
    expect(await checkProductLinePath('/Bad_Path', context)).toMatch(/start and end/)
  })

  it('rejects a Product Line set as its own parent', async () => {
    const document = {
      _id: 'drafts.productLine-grp-kiosk-cabin',
      parent: { _type: 'reference', _ref: 'productLine-grp-kiosk-cabin' }
    }
    expect(await checkProductLinePath('/grp-kiosk-cabin/', contextFor(document, [grp]))).toMatch(
      /own parent/
    )
  })
})
