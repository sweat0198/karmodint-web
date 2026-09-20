import fs from 'node:fs'
import { pathToFileURL } from 'node:url'
import {
  cabinCustomizationConfigurations,
  containerCustomizationConfigurations,
  type SeedCustomizationConfiguration,
  type SeedSizeInput,
} from './lib/seedRecipes'
import { repoPath } from '../catalogue/lib/paths'
import { createSanityClient, readDataset, readSanityTarget } from '../catalogue/lib/sanityEnv'

const CUSTOMIZATION_GROUP_SEED_FILE = 'sanity/seeds/customizationGroups.ndjson'

export const CABIN_PRODUCT_IDS = [
  'product-grp-cabin',
  'product-insulated-panel-cabin',
  'product-metrocity-modular-cabin',
  'product-kompocity-composite-cabin',
  'product-bulletproof-security-cabin'
] as const

export const CONTAINER_PRODUCT_IDS = ['product-k1002-portable-cabin'] as const

export interface SeedCustomizationGroupDocument extends Record<string, unknown> {
  _id: string
  _type: 'customizationGroup'
}

interface ExistingConfiguration {
  group?: { _ref?: string }
}

export interface SyncProduct {
  _id: string
  sizes?: SeedSizeInput[]
  customizationGroups?: Array<{ _ref?: string }>
  customizationConfigurations?: ExistingConfiguration[]
}

export interface PatchableSyncProduct extends SyncProduct {
  _rev: string
}

export interface DevCustomizationSeedSyncPlan {
  createGroups: SeedCustomizationGroupDocument[]
  productPatches: Array<{
    productId: string
    configurations: ExistingConfiguration[]
  }>
  review: string[]
}

export interface DevCustomizationSeedSyncTransaction {
  createOrReplace(document: SeedCustomizationGroupDocument): DevCustomizationSeedSyncTransaction
  patch(
    id: string,
    configure: (patch: any) => any
  ): DevCustomizationSeedSyncTransaction
  commit(): Promise<unknown>
}

export interface DevCustomizationSeedSyncPatch {
  ifRevisionId(revision: string): DevCustomizationSeedSyncPatch
  set(value: { customizationConfigurations: ExistingConfiguration[] }): DevCustomizationSeedSyncPatch
}

export interface DevCustomizationSeedSyncClient {
  fetch(query: string, params?: Record<string, unknown>): Promise<unknown>
  transaction(): DevCustomizationSeedSyncTransaction
}

export interface DevCustomizationSeedSyncResult {
  appliedGroups: number
  appliedProducts: number
  plannedGroups: number
  plannedProducts: number
  review: string[]
}

function requiredConfigurations(product: SyncProduct): SeedCustomizationConfiguration[] {
  if (!product.sizes?.length) {
    throw new Error(`Product "${product._id}" has no Size Options for customization pricing`)
  }
  return (CONTAINER_PRODUCT_IDS as readonly string[]).includes(product._id)
    ? containerCustomizationConfigurations(product._id, product.sizes)
    : cabinCustomizationConfigurations(product._id, product.sizes)
}

/** Parses checked-in NDJSON without accepting unrelated document types. */
export function parseCustomizationGroupSeeds(ndjson: string): SeedCustomizationGroupDocument[] {
  return ndjson.split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line, index) => {
      const document: unknown = JSON.parse(line)
      if (
        !document
        || typeof document !== 'object'
        || !('_id' in document)
        || typeof document._id !== 'string'
        || !('_type' in document)
        || document._type !== 'customizationGroup'
      ) {
        throw new Error(`Invalid Customization Group seed on line ${index + 1}`)
      }
      return document as SeedCustomizationGroupDocument
    })
}

export function loadCustomizationGroupSeeds(): SeedCustomizationGroupDocument[] {
  return parseCustomizationGroupSeeds(fs.readFileSync(repoPath(CUSTOMIZATION_GROUP_SEED_FILE), 'utf-8'))
}

/** Plans canonical dev seed reconciliation. Legacy Products wait for migration before configurations are replaced. */
export function buildDevCustomizationSeedSyncPlan(
  products: SyncProduct[],
  existingGroups: Array<string | SeedCustomizationGroupDocument>,
  seedGroups: SeedCustomizationGroupDocument[],
): DevCustomizationSeedSyncPlan {
  const existingProductById = new Map(products.map((product) => [product._id, product]))
  const existingGroupById = new Map(existingGroups.map((group) => [
    typeof group === 'string' ? group : group._id,
    typeof group === 'string' ? undefined : group,
  ]))
  const createGroups = seedGroups.filter((group) => {
    if (!existingGroupById.has(group._id)) return true
    const existing = existingGroupById.get(group._id)
    return existing ? !hasMatchingSeedContent(existing, group) : false
  })
  const productPatches: DevCustomizationSeedSyncPlan['productPatches'] = []
  const review: string[] = []

  for (const productId of [...CABIN_PRODUCT_IDS, ...CONTAINER_PRODUCT_IDS]) {
    const product = existingProductById.get(productId)
    if (!product) {
      review.push(`Product "${productId}" was not found`)
      continue
    }
    if (product.customizationGroups?.length) continue

    const requiredGroupIds = (CONTAINER_PRODUCT_IDS as readonly string[]).includes(product._id)
      ? [
          'customizationGroup-electricity',
          'customizationGroup-heater',
          'customizationGroup-ac',
          'customizationGroup-wc',
          'customizationGroup-kitchen',
        ]
      : ['customizationGroup-electricity', 'customizationGroup-heater', 'customizationGroup-ac']
    const required = requiredConfigurations(product)
    const existing = product.customizationConfigurations ?? []
    const preserved = existing.filter((configuration) => {
      const groupId = configuration.group?._ref
      return !groupId || !requiredGroupIds.includes(groupId)
    })
    const configurations = [...preserved, ...required]
    if (!hasMatchingSeedContent(
      { _id: product._id, _type: 'customizationGroup', configurations: existing },
      { _id: product._id, _type: 'customizationGroup', configurations },
    )) {
      productPatches.push({ productId: product._id, configurations })
    }
  }

  return { createGroups, productPatches, review }
}

function assertDevDataset(dataset: string): void {
  if (dataset !== 'dev') {
    throw new Error(`Dev customization seed sync refuses dataset "${dataset}"; only "dev" is allowed`)
  }
}

const VERIFICATION_GROUPS_QUERY = '*[_type == "customizationGroup" && _id in $ids]'
const TARGET_PRODUCTS_QUERY = `*[_type == "product" && _id in $ids] {
  _id,
  _rev,
  sizes[]{ _key, lengthM, widthM, heightM },
  customizationGroups[]{ _ref },
  customizationConfigurations[]{
    _key, _type,
    group{ _ref },
    itemOverrides[]{
      _key, itemKey, enabled, pricingType, price, titleOverride, descriptionOverride,
      sizeRules[]{ _key, sizeOptionKey, mode, price, titleOverride, descriptionOverride, review{ status, snapshot } }
    }
  }
}`

async function fetchSyncState(
  client: DevCustomizationSeedSyncClient,
  seedGroups: SeedCustomizationGroupDocument[],
): Promise<{
  products: PatchableSyncProduct[]
  groups: SeedCustomizationGroupDocument[]
}> {
  const [products, groups] = await Promise.all([
    client.fetch(TARGET_PRODUCTS_QUERY, { ids: [...CABIN_PRODUCT_IDS, ...CONTAINER_PRODUCT_IDS] }),
    client.fetch(VERIFICATION_GROUPS_QUERY, { ids: seedGroups.map((group) => group._id) })
  ])
  return { products: products as PatchableSyncProduct[], groups: groups as SeedCustomizationGroupDocument[] }
}

function comparableSeedContent(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(comparableSeedContent)
  if (!value || typeof value !== 'object') return value

  return Object.fromEntries(Object.entries(value as Record<string, unknown>)
    .filter(([key, entry]) => (
      entry !== undefined
      && (!key.startsWith('_') || key === '_id' || key === '_type' || key === '_key')
    ))
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, entry]) => [key, comparableSeedContent(entry)]))
}

function hasMatchingSeedContent(
  existing: SeedCustomizationGroupDocument,
  seed: SeedCustomizationGroupDocument,
): boolean {
  return JSON.stringify(comparableSeedContent(existing)) === JSON.stringify(comparableSeedContent(seed))
}

function verifyAppliedPlan(
  plan: DevCustomizationSeedSyncPlan,
  products: SyncProduct[],
  groups: SeedCustomizationGroupDocument[],
): string[] {
  const groupById = new Map(groups.map((group) => [group._id, group]))
  const productById = new Map(products.map((product) => [product._id, product]))
  const review = plan.createGroups
    .flatMap((group) => {
      const existing = groupById.get(group._id)
      return existing && hasMatchingSeedContent(existing, group)
        ? []
        : [`Customization Group "${group._id}" was not reconciled`]
    })

  for (const patch of plan.productPatches) {
    const actual = productById.get(patch.productId)?.customizationConfigurations ?? []
    if (JSON.stringify(comparableSeedContent(actual)) !== JSON.stringify(comparableSeedContent(patch.configurations))) {
      review.push(`Product "${patch.productId}" customization pricing was not reconciled`)
    }
  }
  return review
}

/** Refuses non-dev targets, dry-runs by default, then verifies committed canonical writes. */
export async function runDevCustomizationSeedSync(
  client: DevCustomizationSeedSyncClient,
  dataset: string,
  apply: boolean,
  seedGroups = loadCustomizationGroupSeeds(),
): Promise<DevCustomizationSeedSyncResult> {
  assertDevDataset(dataset)
  const { products, groups } = await fetchSyncState(client, seedGroups)
  const plan = buildDevCustomizationSeedSyncPlan(products, groups, seedGroups)
  const result = {
    appliedGroups: 0,
    appliedProducts: 0,
    plannedGroups: plan.createGroups.length,
    plannedProducts: plan.productPatches.length,
    review: plan.review
  }
  if (!apply || plan.review.length > 0 || (plan.createGroups.length === 0 && plan.productPatches.length === 0)) {
    return result
  }

  let transaction = client.transaction()
  for (const group of plan.createGroups) transaction = transaction.createOrReplace(group)
  const productsById = new Map(products.map((product) => [product._id, product]))
  for (const patch of plan.productPatches) {
    const product = productsById.get(patch.productId)
    if (!product) throw new Error(`Product "${patch.productId}" disappeared before sync transaction`)
    transaction = transaction.patch(patch.productId, (productPatch: DevCustomizationSeedSyncPatch) => productPatch
      .ifRevisionId(product._rev)
      .set({ customizationConfigurations: patch.configurations }))
  }
  await transaction.commit()

  const verified = await fetchSyncState(client, seedGroups)
  return {
    ...result,
    appliedGroups: plan.createGroups.length,
    appliedProducts: plan.productPatches.length,
    review: verifyAppliedPlan(plan, verified.products, verified.groups)
  }
}

/** Read-only dev gate: requires every seeded Group's content and every canonical Product link to be current. */
export async function verifyDevCustomizationSeedState(
  client: DevCustomizationSeedSyncClient,
  dataset: string,
  seedGroups = loadCustomizationGroupSeeds(),
): Promise<DevCustomizationSeedSyncResult> {
  assertDevDataset(dataset)
  const ids = [...CABIN_PRODUCT_IDS, ...CONTAINER_PRODUCT_IDS]
  const [products, existingGroups] = await Promise.all([
    client.fetch(TARGET_PRODUCTS_QUERY, { ids }),
    client.fetch(VERIFICATION_GROUPS_QUERY, { ids: seedGroups.map((group) => group._id) })
  ])
  const syncProducts = products as SyncProduct[]
  const groupDocuments = existingGroups as SeedCustomizationGroupDocument[]
  const plan = buildDevCustomizationSeedSyncPlan(
    syncProducts,
    groupDocuments,
    seedGroups,
  )
  const groupsById = new Map(groupDocuments.map((group) => [group._id, group]))
  const review = [
    ...plan.review,
    ...seedGroups.flatMap((seed) => {
      const existing = groupsById.get(seed._id)
      if (!existing) return [`Customization Group "${seed._id}" is missing`]
      return hasMatchingSeedContent(existing, seed)
        ? []
        : [`Customization Group "${seed._id}" differs from checked-in seed content`]
    }),
    ...syncProducts.flatMap((product) => product.customizationGroups?.length
      ? [`Product "${product._id}" retains legacy Customization Group references`]
      : []),
  ]

  return {
    appliedGroups: 0,
    appliedProducts: 0,
    plannedGroups: plan.createGroups.length,
    plannedProducts: plan.productPatches.length,
    review
  }
}

async function main(): Promise<void> {
  const apply = process.argv.includes('--apply')
  const verify = process.argv.includes('--verify')
  if (apply && verify) throw new Error('Use either --apply or --verify')
  const dataset = readDataset()
  assertDevDataset(dataset)
  const client = createSanityClient(readSanityTarget())
  const result = verify
    ? await verifyDevCustomizationSeedState(client, dataset)
    : await runDevCustomizationSeedSync(client, dataset, apply)
  console.log(JSON.stringify({ mode: apply ? 'apply' : verify ? 'verify' : 'dry-run', dataset, ...result }, null, 2))
  if (result.review.length > 0 || (verify && (result.plannedGroups > 0 || result.plannedProducts > 0))) {
    process.exitCode = 1
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  main().catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
}
