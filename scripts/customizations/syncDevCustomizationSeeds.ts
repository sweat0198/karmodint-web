import fs from 'node:fs'
import { pathToFileURL } from 'node:url'
import {
  cabinCustomizationConfigurations,
  containerCustomizationConfigurations,
  type SeedCustomizationConfiguration
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
    append: SeedCustomizationConfiguration[]
  }>
  review: string[]
}

export interface DevCustomizationSeedSyncTransaction {
  createIfNotExists(document: SeedCustomizationGroupDocument): DevCustomizationSeedSyncTransaction
  patch(
    id: string,
    configure: (patch: any) => any
  ): DevCustomizationSeedSyncTransaction
  commit(): Promise<unknown>
}

export interface DevCustomizationSeedSyncPatch {
  ifRevisionId(revision: string): DevCustomizationSeedSyncPatch
  setIfMissing(value: { customizationConfigurations: [] }): DevCustomizationSeedSyncPatch
  append(path: 'customizationConfigurations', value: SeedCustomizationConfiguration[]): DevCustomizationSeedSyncPatch
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

function requiredConfigurationGroups(): Array<{
  productId: string
  configurations: SeedCustomizationConfiguration[]
}> {
  return [
    ...CABIN_PRODUCT_IDS.map((productId) => ({
      productId,
      configurations: cabinCustomizationConfigurations()
    })),
    ...CONTAINER_PRODUCT_IDS.map((productId) => ({
      productId,
      configurations: containerCustomizationConfigurations()
    }))
  ]
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

/** Plans additive seed writes. Legacy Products wait for migration before modern links are appended. */
export function buildDevCustomizationSeedSyncPlan(
  products: SyncProduct[],
  existingGroupIds: string[],
  seedGroups: SeedCustomizationGroupDocument[],
): DevCustomizationSeedSyncPlan {
  const existingProductById = new Map(products.map((product) => [product._id, product]))
  const existingGroups = new Set(existingGroupIds)
  const createGroups = seedGroups.filter((group) => !existingGroups.has(group._id))
  const productPatches: DevCustomizationSeedSyncPlan['productPatches'] = []
  const review: string[] = []

  for (const target of requiredConfigurationGroups()) {
    const product = existingProductById.get(target.productId)
    if (!product) {
      review.push(`Product "${target.productId}" was not found`)
      continue
    }
    if (product.customizationGroups?.length) continue

    const configuredGroupIds = new Set(
      product.customizationConfigurations?.flatMap((configuration) =>
        configuration.group?._ref ? [configuration.group._ref] : []
      ) ?? []
    )
    const append = target.configurations.filter((configuration) => !configuredGroupIds.has(configuration.group._ref))
    if (append.length > 0) productPatches.push({ productId: product._id, append })
  }

  return { createGroups, productPatches, review }
}

function assertDevDataset(dataset: string): void {
  if (dataset !== 'dev') {
    throw new Error(`Dev customization seed sync refuses dataset "${dataset}"; only "dev" is allowed`)
  }
}

const GROUP_IDS_QUERY = '*[_type == "customizationGroup"]._id'
const TARGET_PRODUCTS_QUERY = `*[_type == "product" && _id in $ids] {
  _id,
  _rev,
  customizationGroups[]{ _ref },
  customizationConfigurations[]{ group{ _ref } }
}`

async function fetchSyncState(client: DevCustomizationSeedSyncClient): Promise<{
  products: PatchableSyncProduct[]
  groupIds: string[]
}> {
  const [products, groupIds] = await Promise.all([
    client.fetch(TARGET_PRODUCTS_QUERY, { ids: [...CABIN_PRODUCT_IDS, ...CONTAINER_PRODUCT_IDS] }),
    client.fetch(GROUP_IDS_QUERY)
  ])
  return { products: products as PatchableSyncProduct[], groupIds: groupIds as string[] }
}

function verifyAppliedPlan(plan: DevCustomizationSeedSyncPlan, products: SyncProduct[], groupIds: string[]): string[] {
  const groupSet = new Set(groupIds)
  const productById = new Map(products.map((product) => [product._id, product]))
  const review = plan.createGroups
    .filter((group) => !groupSet.has(group._id))
    .map((group) => `Customization Group "${group._id}" was not created`)

  for (const patch of plan.productPatches) {
    const configuredGroupIds = new Set(productById.get(patch.productId)?.customizationConfigurations
      ?.flatMap((configuration) => configuration.group?._ref ? [configuration.group._ref] : []) ?? [])
    for (const configuration of patch.append) {
      if (!configuredGroupIds.has(configuration.group._ref)) {
        review.push(`Product "${patch.productId}" is missing Customization Group "${configuration.group._ref}" after sync`)
      }
    }
  }
  return review
}

/** Refuses non-dev targets, dry-runs by default, then verifies committed additive writes. */
export async function runDevCustomizationSeedSync(
  client: DevCustomizationSeedSyncClient,
  dataset: string,
  apply: boolean,
  seedGroups = loadCustomizationGroupSeeds(),
): Promise<DevCustomizationSeedSyncResult> {
  assertDevDataset(dataset)
  const { products, groupIds } = await fetchSyncState(client)
  const plan = buildDevCustomizationSeedSyncPlan(products, groupIds, seedGroups)
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
  for (const group of plan.createGroups) transaction = transaction.createIfNotExists(group)
  const productsById = new Map(products.map((product) => [product._id, product]))
  for (const patch of plan.productPatches) {
    const product = productsById.get(patch.productId)
    if (!product) throw new Error(`Product "${patch.productId}" disappeared before sync transaction`)
    transaction = transaction.patch(patch.productId, (productPatch: DevCustomizationSeedSyncPatch) => productPatch
      .ifRevisionId(product._rev)
      .setIfMissing({ customizationConfigurations: [] })
      .append('customizationConfigurations', patch.append))
  }
  await transaction.commit()

  const verified = await fetchSyncState(client)
  return {
    ...result,
    appliedGroups: plan.createGroups.length,
    appliedProducts: plan.productPatches.length,
    review: verifyAppliedPlan(plan, verified.products, verified.groupIds)
  }
}

async function main(): Promise<void> {
  const apply = process.argv.includes('--apply')
  const verify = process.argv.includes('--verify')
  if (apply && verify) throw new Error('Use either --apply or --verify')
  const dataset = readDataset()
  assertDevDataset(dataset)
  const client = createSanityClient(readSanityTarget())
  const result = await runDevCustomizationSeedSync(client, dataset, apply && !verify)
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
