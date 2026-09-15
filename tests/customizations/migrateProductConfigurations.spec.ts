import { describe, expect, it } from 'vitest'
import {
  applyCustomizationMigration,
  buildCustomizationMigrationReport,
  planProductCustomizationMigration,
  runCustomizationMigration
} from '../../scripts/customizations/migrateProductConfigurations'

describe('Product customization configuration migration', () => {
  it('converts ordered legacy group references without copying fixed, included, or POA defaults', () => {
    const plan = planProductCustomizationMigration({
      _id: 'product-test',
      sizes: [{ _key: 'standard', lengthM: 3, widthM: 2.4 }],
      customizationGroups: [
        { _ref: 'group-electrical' },
        { _ref: 'group-finishes' }
      ]
    }, [
      {
        _id: 'group-electrical',
        items: [
          { _key: 'fixed', scope: 'universal', pricingType: 'fixed', price: 250 },
          { _key: 'included', scope: 'universal', pricingType: 'included', price: 0 },
          { _key: 'poa', scope: 'universal', pricingType: 'poa' }
        ]
      },
      { _id: 'group-finishes', items: [] }
    ])

    expect(plan).toEqual({
      productId: 'product-test',
      configurations: [
        {
          _key: 'legacy-group-1',
          _type: 'productCustomizationConfiguration',
          group: { _type: 'reference', _ref: 'group-electrical' }
        },
        {
          _key: 'legacy-group-2',
          _type: 'productCustomizationConfiguration',
          group: { _type: 'reference', _ref: 'group-finishes' }
        }
      ]
    })
  })

  it('adds reviewed inherit rules for every size-dependent item without changing its default price', () => {
    const plan = planProductCustomizationMigration({
      _id: 'product-sized',
      sizes: [{ _key: 'small', lengthM: 3, widthM: 2.4 }],
      customizationGroups: [{ _ref: 'group-electrical' }]
    }, [{
      _id: 'group-electrical',
      items: [{ _key: 'electricity', scope: 'sizeDependent', pricingType: 'fixed', price: 250 }]
    }])

    expect(plan.configurations[0]).toMatchObject({
      itemOverrides: [{
        itemKey: 'electricity',
        sizeRules: [{
          sizeOptionKey: 'small',
          mode: 'inherit',
          review: {
            status: 'reviewed',
            snapshot: JSON.stringify({
              sizeOptionKey: 'small',
              lengthM: 3,
              widthM: 2.4,
              heightM: null,
              mode: 'inherit',
              price: null,
              titleOverride: null,
              descriptionOverride: null,
              resolvedPricingType: 'fixed',
              resolvedPrice: 250,
              resolvedTitle: null,
              resolvedDescription: null
            })
          }
        }]
      }]
    })
  })

  it('refuses every conversion and identifies each Product requiring review', () => {
    const report = buildCustomizationMigrationReport([
      {
        _id: 'product-ready',
        sizes: [{ _key: 'standard' }],
        customizationGroups: [{ _ref: 'group-ready' }]
      },
      {
        _id: 'product-mixed',
        customizationGroups: [{ _ref: 'group-ready' }],
        customizationConfigurations: [{ _key: 'existing' }]
      },
      {
        _id: 'product-duplicate',
        customizationGroups: [{ _ref: 'group-ready' }, { _ref: 'group-ready' }]
      },
      {
        _id: 'product-orphaned',
        customizationGroups: [{ _ref: 'missing-group' }]
      }
    ], [{ _id: 'group-ready', items: [{ _key: 'ready-item', scope: 'universal' }] }])

    expect(report.plans).toEqual([])
    expect(report.review).toEqual([
      { productId: 'product-mixed', reason: 'already has Product Customization Configurations' },
      { productId: 'product-duplicate', reason: 'references Customization Group "group-ready" more than once' },
      { productId: 'product-orphaned', reason: 'references unavailable Customization Group "missing-group"' }
    ])
  })

  it('applies a clean report in one transaction and unsets legacy references', async () => {
    const report = buildCustomizationMigrationReport([{
      _id: 'product-ready',
      customizationGroups: [{ _ref: 'group-ready' }]
    }], [{ _id: 'group-ready', items: [{ _key: 'ready-item', scope: 'universal' }] }])
    const patches: Array<{ id: string; patch: unknown }> = []
    let commits = 0
    const transaction = {
      patch(id: string, patch: unknown) {
        patches.push({ id, patch })
        return transaction
      },
      async commit() {
        commits += 1
      }
    }

    const result = await applyCustomizationMigration({ transaction: () => transaction }, report, true)

    expect(result).toEqual({ applied: 1, review: [] })
    expect(commits).toBe(1)
    expect(patches).toEqual([{
      id: 'product-ready',
      patch: {
        set: { customizationConfigurations: report.plans[0].configurations },
        unset: ['customizationGroups']
      }
    }])
  })

  it('does not open a transaction when review items exist or apply is false', async () => {
    const report = { plans: [], review: [{ productId: 'product-review', reason: 'missing group' }] }
    let transactions = 0
    const client = {
      transaction() {
        transactions += 1
        throw new Error('must not open a transaction')
      }
    }

    await expect(applyCustomizationMigration(client, report, true)).rejects.toThrow('product-review')
    expect(await applyCustomizationMigration(client, { plans: [], review: [] }, false)).toEqual({ applied: 0, review: [] })
    expect(transactions).toBe(0)
  })

  it('loads every Product and referenced group before returning a dry-run report', async () => {
    const queries: string[] = []
    const client = {
      async fetch(query: string) {
        queries.push(query)
        return query.includes('_type == "product"')
          ? [{ _id: 'product-ready', customizationGroups: [{ _ref: 'group-ready' }] }]
          : [{ _id: 'group-ready', items: [{ _key: 'ready-item', scope: 'universal' }] }]
      },
      transaction() {
        throw new Error('dry run cannot write')
      }
    }

    await expect(runCustomizationMigration(client, false)).resolves.toEqual({
      applied: 0,
      review: [],
      planned: 1
    })
    expect(queries).toHaveLength(2)
    expect(queries[0]).toContain('customizationGroups')
    expect(queries[0]).toContain('customizationConfigurations')
    expect(queries[1]).toContain('_type == "customizationGroup"')
  })
})
