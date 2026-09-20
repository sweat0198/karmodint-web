import { pathToFileURL } from 'node:url'
import { createSanityClient, readSanityTarget } from '../catalogue/lib/sanityEnv'
import {
  createSizeRuleSnapshot,
  validatePublishedCustomizationRules
} from '../../sanity/schemas/product'

export interface LegacyCustomizationGroupReference {
  _ref?: string
}

export interface MigrationSizeOption {
  _key?: string
  lengthM?: number
  widthM?: number
  heightM?: number
}

export interface MigrationProduct {
  _id: string
  status?: 'published' | 'draft' | 'archived'
  sizes?: MigrationSizeOption[]
  customizationGroups?: LegacyCustomizationGroupReference[]
  customizationConfigurations?: MigrationConfiguration[]
}

export interface MigrationCustomizationGroup {
  _id: string
  selectionType?: 'single' | 'multiple' | 'boolean'
  isMandatory?: boolean
  maxSelections?: number
  items?: Array<{
    _key?: string
    scope?: 'universal' | 'sizeDependent'
    pricingType?: 'fixed' | 'included' | 'poa'
    price?: number
    title?: string
    description?: string
    selectionRequirements?: Array<{
      group?: { _ref?: string }
      itemKey?: string
    }>
  }>
}

interface MigrationSizeRule {
  _key: string
  sizeOptionKey: string
  mode: 'inherit' | 'fixed' | 'included' | 'poa' | 'unavailable'
  price?: number
  titleOverride?: string
  descriptionOverride?: string
  review?: { status: 'pending' | 'reviewed'; snapshot?: string }
}

interface MigrationItemOverride {
  _key: string
  itemKey: string
  enabled?: boolean
  pricingType?: 'fixed' | 'included' | 'poa'
  price?: number
  titleOverride?: string
  descriptionOverride?: string
  sizeRules?: MigrationSizeRule[]
}

interface MigrationConfiguration {
  _key?: string
  group?: { _type?: 'reference'; _ref?: string }
  itemOverrides?: MigrationItemOverride[]
}

export interface ProductCustomizationMigrationPlan {
  productId: string
  configurations: Array<{
    _key: string
    _type: 'productCustomizationConfiguration'
    group: { _type: 'reference'; _ref: string }
    itemOverrides?: MigrationItemOverride[]
  }>
}

export interface CustomizationMigrationReviewItem {
  productId: string
  reason: string
}

export interface CustomizationMigrationReport {
  plans: ProductCustomizationMigrationPlan[]
  review: CustomizationMigrationReviewItem[]
}

export interface CustomizationMigrationTransaction {
  patch(id: string, patch: {
    set: { customizationConfigurations: ProductCustomizationMigrationPlan['configurations'] }
    unset: string[]
  }): CustomizationMigrationTransaction
  commit(): Promise<unknown>
}

export interface CustomizationMigrationWriter {
  transaction(): CustomizationMigrationTransaction
}

export interface CustomizationMigrationClient extends CustomizationMigrationWriter {
  fetch<T>(query: string): Promise<T>
}

function migrationReason(
  product: MigrationProduct,
  groupsById: Map<string, MigrationCustomizationGroup>,
): string | undefined {
  if (product.customizationConfigurations?.length) {
    return 'already has Product Customization Configurations'
  }

  const referencedGroupIds = new Set<string>()
  for (const reference of product.customizationGroups ?? []) {
    if (!reference._ref || !groupsById.has(reference._ref)) {
      return `references unavailable Customization Group "${reference._ref ?? '(missing reference)'}"`
    }
    if (referencedGroupIds.has(reference._ref)) {
      return `references Customization Group "${reference._ref}" more than once`
    }
    referencedGroupIds.add(reference._ref)

    const itemKeys = new Set<string>()
    for (const item of groupsById.get(reference._ref)?.items ?? []) {
      if (!item._key) return `Customization Group "${reference._ref}" contains an item without a key`
      if (itemKeys.has(item._key)) {
        return `Customization Group "${reference._ref}" contains more than one item "${item._key}"`
      }
      itemKeys.add(item._key)
      if (item.scope === 'sizeDependent') {
        for (const size of product.sizes ?? []) {
          if (!size._key) return 'contains a Size Option without a key for a size-dependent Customization Item'
        }
      }
    }
  }
}

function createInheritedSizeRule(
  size: MigrationSizeOption,
  item: NonNullable<MigrationCustomizationGroup['items']>[number],
): MigrationSizeRule {
  const rule: MigrationSizeRule = {
    _key: `legacy-rule-${item._key}-${size._key}`,
    sizeOptionKey: size._key!,
    mode: 'inherit'
  }
  return {
    ...rule,
    review: { status: 'reviewed', snapshot: createSizeRuleSnapshot(size, rule, undefined, item) }
  }
}

/** Translates ordered legacy references without duplicating group-owned item defaults. */
export function planProductCustomizationMigration(
  product: MigrationProduct,
  groups: MigrationCustomizationGroup[],
): ProductCustomizationMigrationPlan {
  const groupsById = new Map(groups.map((group) => [group._id, group]))
  const reason = migrationReason(product, groupsById)
  if (reason) throw new Error(`Product ${product._id} ${reason}`)

  return {
    productId: product._id,
    configurations: (product.customizationGroups ?? []).map((reference, index) => {
      const groupId = reference._ref
      const group = groupId ? groupsById.get(groupId) : undefined
      if (!groupId || !group) throw new Error(`Product ${product._id} has an unavailable Customization Group`)
      const itemOverrides = (group.items ?? [])
        .filter((item) => item.scope === 'sizeDependent')
        .map((item) => ({
          _key: `legacy-override-${item._key}`,
          itemKey: item._key!,
          sizeRules: (product.sizes ?? []).map((size) => createInheritedSizeRule(size, item))
        }))

      return {
        _key: `legacy-group-${index + 1}`,
        _type: 'productCustomizationConfiguration',
        group: { _type: 'reference', _ref: groupId },
        ...(itemOverrides.length > 0 ? { itemOverrides } : {})
      }
    })
  }
}

/** Plans only an all-clean batch so a reviewed dataset cannot be partially contracted. */
export function buildCustomizationMigrationReport(
  products: MigrationProduct[],
  groups: MigrationCustomizationGroup[],
): CustomizationMigrationReport {
  const groupsById = new Map(groups.map((group) => [group._id, group]))
  const productsToMigrate = products.filter((product) => product.customizationGroups?.length)
  const migrationReview = productsToMigrate.flatMap((product) => {
    const reason = migrationReason(product, groupsById)
    return reason ? [{ productId: product._id, reason }] : []
  })
  const plans = migrationReview.length === 0
    ? productsToMigrate.map((product) => planProductCustomizationMigration(product, groups))
    : []
  const plansByProductId = new Map(plans.map((plan) => [plan.productId, plan]))
  const validationReview = products.flatMap((product) => {
    if (product.status !== 'published') return []

    const plan = plansByProductId.get(product._id)
    const validation = validatePublishedCustomizationRules(
      plan ? { ...product, customizationConfigurations: plan.configurations } : product,
      groups,
    )
    return validation === true
      ? []
      : [{ productId: product._id, reason: `published configuration invalid: ${validation}` }]
  })
  const review = [...migrationReview, ...validationReview]

  return {
    plans: review.length === 0 ? plans : [],
    review
  }
}

/** Applies a pre-validated batch atomically. Callers must opt in with `apply`. */
export async function applyCustomizationMigration(
  client: CustomizationMigrationWriter,
  report: CustomizationMigrationReport,
  apply: boolean,
): Promise<{ applied: number; review: CustomizationMigrationReviewItem[] }> {
  if (report.review.length > 0) {
    throw new Error(`Customization migration requires review:\n${report.review
      .map((item) => `- ${item.productId}: ${item.reason}`)
      .join('\n')}`)
  }
  if (!apply || report.plans.length === 0) return { applied: 0, review: [] }

  const transaction = client.transaction()
  for (const plan of report.plans) {
    transaction.patch(plan.productId, {
      set: { customizationConfigurations: plan.configurations },
      unset: ['customizationGroups']
    })
  }
  await transaction.commit()

  return { applied: report.plans.length, review: [] }
}

const MIGRATION_PRODUCTS_QUERY = `*[_type == "product"] {
  _id,
  status,
  sizes[]{ _key, lengthM, widthM, heightM },
  customizationGroups[]{ _ref },
  customizationConfigurations[]{
    _key,
    group{ _ref },
    itemOverrides[]{
      _key, itemKey, enabled, pricingType, price, titleOverride, descriptionOverride,
      sizeRules[]{ _key, sizeOptionKey, mode, price, titleOverride, descriptionOverride, review{ status, snapshot } }
    }
  }
}`

const MIGRATION_GROUPS_QUERY = `*[_type == "customizationGroup"] {
  _id,
  selectionType,
  isMandatory,
  maxSelections,
  items[]{
    _key, scope, pricingType, price, title, description,
    selectionRequirements[]{ group{ _ref }, itemKey }
  }
}`

/** Fetches all migration inputs before deciding whether a transaction may be opened. */
export async function runCustomizationMigration(
  client: CustomizationMigrationClient,
  apply: boolean,
): Promise<{ applied: number; planned: number; review: CustomizationMigrationReviewItem[] }> {
  const [products, groups] = await Promise.all([
    client.fetch<MigrationProduct[]>(MIGRATION_PRODUCTS_QUERY),
    client.fetch<MigrationCustomizationGroup[]>(MIGRATION_GROUPS_QUERY)
  ])
  const report = buildCustomizationMigrationReport(products, groups)
  if (!apply || report.review.length > 0) {
    return { applied: 0, planned: report.plans.length, review: report.review }
  }

  const result = await applyCustomizationMigration(client, report, true)
  return { ...result, planned: report.plans.length }
}

async function main(): Promise<void> {
  const apply = process.argv.includes('--apply')
  const client = createSanityClient(readSanityTarget())
  const result = await runCustomizationMigration(client, apply)
  console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', ...result }, null, 2))
  if (result.review.length > 0) process.exitCode = 1
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  main().catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
}
