import { describe, expect, it } from 'vitest'
import {
  CABIN_PRODUCT_IDS,
  buildDevCustomizationSeedSyncPlan,
  CONTAINER_PRODUCT_IDS,
  runDevCustomizationSeedSync,
  type SeedCustomizationGroupDocument
} from '../../scripts/customizations/syncDevCustomizationSeeds'

const SEED_GROUPS: SeedCustomizationGroupDocument[] = [
  { _id: 'customizationGroup-electricity', _type: 'customizationGroup', title: 'Electricity' },
  { _id: 'customizationGroup-heater', _type: 'customizationGroup', title: 'Heater' },
  { _id: 'customizationGroup-ac', _type: 'customizationGroup', title: 'Air Conditioning' },
  { _id: 'customizationGroup-wc', _type: 'customizationGroup', title: 'WC' },
  { _id: 'customizationGroup-kitchen', _type: 'customizationGroup', title: 'Kitchen' }
]

describe('dev customization seed sync', () => {
  it('refuses every non-dev dataset before fetching or writing', async () => {
    const client = {
      fetch() {
        throw new Error('must not fetch')
      },
      transaction() {
        throw new Error('must not write')
      }
    }

    await expect(runDevCustomizationSeedSync(client, 'production', false)).rejects
      .toThrow('refuses dataset "production"; only "dev" is allowed')
  })

  it('plans missing group documents with only intended Product configuration additions', () => {
    const plan = buildDevCustomizationSeedSyncPlan([
      { _id: 'product-grp-cabin', customizationConfigurations: [] },
      { _id: 'product-k1002-portable-cabin', customizationConfigurations: [] },
      { _id: 'product-unrelated', customizationConfigurations: [] }
    ], ['customizationGroup-electricity'], SEED_GROUPS)

    expect(plan.createGroups.map((group) => group._id)).toEqual([
      'customizationGroup-heater',
      'customizationGroup-ac',
      'customizationGroup-wc',
      'customizationGroup-kitchen'
    ])
    expect(plan.productPatches).toEqual([
      {
        productId: 'product-grp-cabin',
        append: expect.arrayContaining([
          expect.objectContaining({ group: expect.objectContaining({ _ref: 'customizationGroup-electricity' }) }),
          expect.objectContaining({ group: expect.objectContaining({ _ref: 'customizationGroup-heater' }) }),
          expect.objectContaining({ group: expect.objectContaining({ _ref: 'customizationGroup-ac' }) })
        ])
      },
      {
        productId: 'product-k1002-portable-cabin',
        append: expect.arrayContaining([
          expect.objectContaining({ group: expect.objectContaining({ _ref: 'customizationGroup-electricity' }) }),
          expect.objectContaining({ group: expect.objectContaining({ _ref: 'customizationGroup-heater' }) }),
          expect.objectContaining({ group: expect.objectContaining({ _ref: 'customizationGroup-ac' }) }),
          expect.objectContaining({ group: expect.objectContaining({ _ref: 'customizationGroup-wc' }) }),
          expect.objectContaining({ group: expect.objectContaining({ _ref: 'customizationGroup-kitchen' }) })
        ])
      }
    ])
  })

  it('appends only absent group references and preserves existing overrides', () => {
    const existing = {
      _key: 'electricity',
      _type: 'productCustomizationConfiguration' as const,
      group: { _type: 'reference' as const, _ref: 'customizationGroup-electricity' },
      itemOverrides: [{ _key: 'preserve', itemKey: 'elec-2', enabled: false }]
    }
    const plan = buildDevCustomizationSeedSyncPlan([
      { _id: 'product-grp-cabin', customizationConfigurations: [existing] }
    ], SEED_GROUPS.map((group) => group._id), SEED_GROUPS)

    expect(plan.productPatches).toEqual([{
      productId: 'product-grp-cabin',
      append: [
        expect.objectContaining({ group: expect.objectContaining({ _ref: 'customizationGroup-heater' }) }),
        expect.objectContaining({ group: expect.objectContaining({ _ref: 'customizationGroup-ac' }) })
      ]
    }])
    expect(existing.itemOverrides).toEqual([{ _key: 'preserve', itemKey: 'elec-2', enabled: false }])
  })

  it('is idempotent after every desired group is present', () => {
    const cabinConfigurations = [
      'customizationGroup-electricity',
      'customizationGroup-heater',
      'customizationGroup-ac'
    ].map((groupId) => ({ group: { _ref: groupId } }))
    const containerConfigurations = [
      ...cabinConfigurations,
      { group: { _ref: 'customizationGroup-wc' } },
      { group: { _ref: 'customizationGroup-kitchen' } }
    ]

    expect(buildDevCustomizationSeedSyncPlan([
      ...CABIN_PRODUCT_IDS.map((_id) => ({ _id, customizationConfigurations: cabinConfigurations })),
      ...CONTAINER_PRODUCT_IDS.map((_id) => ({ _id, customizationConfigurations: containerConfigurations }))
    ], SEED_GROUPS.map((group) => group._id), SEED_GROUPS)).toEqual({
      createGroups: [],
      productPatches: [],
      review: []
    })
  })

  it('reports every missing canonical Product instead of silently succeeding', () => {
    const plan = buildDevCustomizationSeedSyncPlan([], SEED_GROUPS.map((group) => group._id), SEED_GROUPS)

    expect(plan.productPatches).toEqual([])
    expect(plan.review).toEqual([
      ...CABIN_PRODUCT_IDS,
      ...CONTAINER_PRODUCT_IDS
    ].map((productId) => `Product "${productId}" was not found`))
  })

  it('commits planned additions once then re-reads and verifies them', async () => {
    const products = [
      { _id: 'product-grp-cabin', customizationConfigurations: [] as Array<{ group: { _ref: string } }> },
      ...CABIN_PRODUCT_IDS.slice(1).map((_id) => ({
        _id,
        customizationConfigurations: ['customizationGroup-electricity', 'customizationGroup-heater', 'customizationGroup-ac']
          .map((_ref) => ({ group: { _ref } }))
      })),
      ...CONTAINER_PRODUCT_IDS.map((_id) => ({
        _id,
        customizationConfigurations: [
          'customizationGroup-electricity',
          'customizationGroup-heater',
          'customizationGroup-ac',
          'customizationGroup-wc',
          'customizationGroup-kitchen'
        ].map((_ref) => ({ group: { _ref } }))
      }))
    ]
    const groupIds: string[] = []
    let commits = 0
    const transaction = {
      createIfNotExists(group: { _id: string }) {
        groupIds.push(group._id)
        return transaction
      },
      patch(id: string, configure: (patch: {
        setIfMissing(value: { customizationConfigurations: [] }): typeof patch
        append(path: 'customizationConfigurations', value: Array<{ group: { _ref: string } }>): typeof patch
      }) => unknown) {
        const patch = {
          setIfMissing(_value: { customizationConfigurations: [] }) {
            return patch
          },
          append(path: 'customizationConfigurations', value: Array<{ group: { _ref: string } }>) {
            products.find((product) => product._id === id)!.customizationConfigurations.push(...value)
            return patch
          }
        }
        configure(patch)
        return transaction
      },
      async commit() {
        commits += 1
      }
    }
    const client = {
      async fetch(query: string) {
        return query.includes(']._id') ? groupIds : products
      },
      transaction() {
        return transaction
      }
    }

    await expect(runDevCustomizationSeedSync(client, 'dev', true, SEED_GROUPS)).resolves.toEqual({
      appliedGroups: 5,
      appliedProducts: 1,
      plannedGroups: 5,
      plannedProducts: 1,
      review: []
    })
    expect(commits).toBe(1)
  })
})
