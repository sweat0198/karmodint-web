import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  CABIN_PRODUCT_IDS,
  buildDevCustomizationSeedSyncPlan,
  CONTAINER_PRODUCT_IDS,
  runDevCustomizationSeedSync,
  verifyDevCustomizationSeedState,
  type SeedCustomizationGroupDocument,
  type SyncProduct
} from '../../scripts/customizations/syncDevCustomizationSeeds'
import { planProductCustomizationMigration } from '../../scripts/customizations/migrateProductConfigurations'

const SEED_GROUPS: SeedCustomizationGroupDocument[] = [
  { _id: 'customizationGroup-electricity', _type: 'customizationGroup', title: 'Electricity' },
  { _id: 'customizationGroup-heater', _type: 'customizationGroup', title: 'Heater' },
  { _id: 'customizationGroup-ac', _type: 'customizationGroup', title: 'Air Conditioning' },
  { _id: 'customizationGroup-wc', _type: 'customizationGroup', title: 'WC' },
  { _id: 'customizationGroup-kitchen', _type: 'customizationGroup', title: 'Kitchen' }
]

function fullyConfiguredProducts(): SyncProduct[] {
  const cabinConfigurations = [
    'customizationGroup-electricity',
    'customizationGroup-heater',
    'customizationGroup-ac'
  ].map((_ref) => ({ group: { _ref } }))
  const containerConfigurations = [
    ...cabinConfigurations,
    { group: { _ref: 'customizationGroup-wc' } },
    { group: { _ref: 'customizationGroup-kitchen' } }
  ]
  return [
    ...CABIN_PRODUCT_IDS.map((_id) => ({ _id, customizationConfigurations: cabinConfigurations })),
    ...CONTAINER_PRODUCT_IDS.map((_id) => ({ _id, customizationConfigurations: containerConfigurations }))
  ]
}

describe('dev customization seed sync', () => {
  it('keeps the dev-only preflight additive and out of production deploy scripts', () => {
    const packageJson = JSON.parse(fs.readFileSync(
      fileURLToPath(new URL('../../package.json', import.meta.url)),
      'utf8'
    )) as { scripts: Record<string, string> }

    expect(packageJson.scripts['customizations:prepare-dev']).toBe(
      'npm run customizations:sync-dev -- --apply && npm run customizations:migrate -- --apply && npm run customizations:sync-dev -- --apply && npm run customizations:migrate -- --apply && npm run customizations:verify-dev'
    )
    expect(packageJson.scripts['customizations:verify-dev']).toBe(
      'jiti scripts/customizations/syncDevCustomizationSeeds.ts --verify'
    )
    expect(packageJson.scripts['sanity:deploy-dev']).toBe(
      'npm run customizations:prepare-dev && npm --prefix sanity run deploy'
    )
    for (const [name, command] of Object.entries(packageJson.scripts)) {
      if (name === 'build' || (name.includes('deploy') && name !== 'sanity:deploy-dev')) {
        expect(command).not.toContain('customizations:')
      }
    }

    const studioPackage = JSON.parse(fs.readFileSync(
      fileURLToPath(new URL('../../sanity/package.json', import.meta.url)),
      'utf8'
    )) as { scripts: Record<string, string> }
    for (const [name, command] of Object.entries(studioPackage.scripts)) {
      if (name.includes('deploy')) expect(command).not.toContain('customizations:')
    }
    expect(studioPackage.scripts.deploy).toBe('sanity deploy')
  })

  it('creates missing groups before migrating legacy Products, then appends only missing modern links', () => {
    const legacyProduct = {
      _id: 'product-grp-cabin',
      customizationGroups: [{ _ref: 'customizationGroup-electricity' }],
      customizationConfigurations: []
    }

    const bootstrapPlan = buildDevCustomizationSeedSyncPlan([legacyProduct], [], SEED_GROUPS)
    expect(bootstrapPlan.createGroups).toHaveLength(5)
    expect(bootstrapPlan.productPatches).toEqual([])

    const migrated = planProductCustomizationMigration(legacyProduct, SEED_GROUPS)
    const postMigrationPlan = buildDevCustomizationSeedSyncPlan([{
      _id: legacyProduct._id,
      customizationConfigurations: migrated.configurations
    }], SEED_GROUPS.map((group) => group._id), SEED_GROUPS)

    expect(postMigrationPlan.productPatches).toEqual([{
      productId: 'product-grp-cabin',
      append: [
        expect.objectContaining({ group: expect.objectContaining({ _ref: 'customizationGroup-heater' }) }),
        expect.objectContaining({ group: expect.objectContaining({ _ref: 'customizationGroup-ac' }) })
      ]
    }])
  })

  it('flags a seeded group whose existing content diverges even when its ID exists', async () => {
    const existingGroups = SEED_GROUPS.map((group) => group._id === 'customizationGroup-ac'
      ? { ...group, items: [] }
      : group)
    const client = {
      async fetch(query: string) {
        return query.includes('_type == "product"') ? fullyConfiguredProducts() : existingGroups
      },
      transaction() {
        throw new Error('verification must not write')
      }
    }

    await expect(verifyDevCustomizationSeedState(client, 'dev', SEED_GROUPS)).resolves.toEqual({
      appliedGroups: 0,
      appliedProducts: 0,
      plannedGroups: 0,
      plannedProducts: 0,
      review: ['Customization Group "customizationGroup-ac" differs from checked-in seed content']
    })
  })

  it('flags canonical Products retaining legacy group references during verification', async () => {
    const products = fullyConfiguredProducts()
    products[0] = {
      _id: 'product-grp-cabin',
      customizationGroups: [{ _ref: 'customizationGroup-electricity' }],
      customizationConfigurations: []
    }
    const client = {
      async fetch(query: string) {
        return query.includes('_type == "product"') ? products : SEED_GROUPS
      },
      transaction() {
        throw new Error('verification must not write')
      }
    }

    await expect(verifyDevCustomizationSeedState(client, 'dev', SEED_GROUPS)).resolves.toEqual({
      appliedGroups: 0,
      appliedProducts: 0,
      plannedGroups: 0,
      plannedProducts: 0,
      review: ['Product "product-grp-cabin" retains legacy Customization Group references']
    })
  })

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

  it('dry-runs a non-empty plan without opening a transaction', async () => {
    let transactionCalls = 0
    const client = {
      async fetch(query: string) {
        if (query.includes(']._id')) return []
        return [
          ...CABIN_PRODUCT_IDS.map((_id) => ({ _id, customizationConfigurations: [] })),
          ...CONTAINER_PRODUCT_IDS.map((_id) => ({ _id, customizationConfigurations: [] }))
        ]
      },
      transaction() {
        transactionCalls += 1
        throw new Error('dry-run must not open a transaction')
      }
    }

    await expect(runDevCustomizationSeedSync(client, 'dev', false, SEED_GROUPS)).resolves.toEqual({
      appliedGroups: 0,
      appliedProducts: 0,
      plannedGroups: 5,
      plannedProducts: 6,
      review: []
    })
    expect(transactionCalls).toBe(0)
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
      { _id: 'product-grp-cabin', _rev: 'cabin-revision', customizationConfigurations: [] as Array<{ group: { _ref: string } }> },
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
        ifRevisionId(revision: string): typeof patch
        setIfMissing(value: { customizationConfigurations: [] }): typeof patch
        append(path: 'customizationConfigurations', value: Array<{ group: { _ref: string } }>): typeof patch
      }) => unknown) {
        const patch = {
          ifRevisionId(_revision: string) {
            return patch
          },
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

  it('returns a review when post-apply verification cannot find an appended configuration', async () => {
    const products = [
      { _id: 'product-grp-cabin', customizationConfigurations: [] },
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
    const transaction = {
      createIfNotExists(group: { _id: string }) {
        groupIds.push(group._id)
        return transaction
      },
      patch(_id: string, _configure: unknown) {
        return transaction
      },
      async commit() {}
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
      review: [
        'Product "product-grp-cabin" is missing Customization Group "customizationGroup-electricity" after sync',
        'Product "product-grp-cabin" is missing Customization Group "customizationGroup-heater" after sync',
        'Product "product-grp-cabin" is missing Customization Group "customizationGroup-ac" after sync'
      ]
    })
  })

  it('guards Product patches by revision and propagates a concurrent-edit conflict', async () => {
    const products = [
      { _id: 'product-grp-cabin', _rev: 'cabin-revision', customizationConfigurations: [] },
      ...CABIN_PRODUCT_IDS.slice(1).map((_id) => ({
        _id,
        _rev: `${_id}-revision`,
        customizationConfigurations: ['customizationGroup-electricity', 'customizationGroup-heater', 'customizationGroup-ac']
          .map((_ref) => ({ group: { _ref } }))
      })),
      ...CONTAINER_PRODUCT_IDS.map((_id) => ({
        _id,
        _rev: `${_id}-revision`,
        customizationConfigurations: [
          'customizationGroup-electricity',
          'customizationGroup-heater',
          'customizationGroup-ac',
          'customizationGroup-wc',
          'customizationGroup-kitchen'
        ].map((_ref) => ({ group: { _ref } }))
      }))
    ]
    const revisions: string[] = []
    const transaction = {
      createIfNotExists() {
        return transaction
      },
      patch(_id: string, configure: (patch: {
        ifRevisionId(revision: string): typeof patch
        setIfMissing(value: { customizationConfigurations: [] }): typeof patch
        append(path: 'customizationConfigurations', value: unknown[]): typeof patch
      }) => unknown) {
        const patch = {
          ifRevisionId(revision: string) {
            revisions.push(revision)
            return patch
          },
          setIfMissing(_value: { customizationConfigurations: [] }) {
            return patch
          },
          append(_path: 'customizationConfigurations', _value: unknown[]) {
            return patch
          }
        }
        configure(patch)
        return transaction
      },
      async commit() {
        throw new Error('revision conflict')
      }
    }
    const client = {
      async fetch(query: string) {
        return query.includes(']._id') ? SEED_GROUPS.map((group) => group._id) : products
      },
      transaction() {
        return transaction
      }
    }

    await expect(runDevCustomizationSeedSync(client, 'dev', true, SEED_GROUPS)).rejects.toThrow('revision conflict')
    expect(revisions).toEqual(['cabin-revision'])
  })
})
