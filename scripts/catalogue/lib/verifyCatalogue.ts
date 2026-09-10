import type { AssetManifest } from './assets'
import { SEED_FILE, type SeedProduct } from './buildSeed'
import { PLAN_VIEW, type ProductImageView } from '../../../sanity/schemas/objects/productImageViews'

/**
 * Whole-catalogue verification, read back out of the dataset rather than off the manifest.
 *
 * Tickets 02–06 each proved one product. The properties this module checks are the ones that only
 * exist once all five are present — totals, cross-product uniqueness, and the guarantee the schema
 * restructure was built around: that no size can surface another size's imagery.
 *
 * Two independent expectations are held against the dataset, and the difference between them is the
 * point:
 *
 *  - `EXPECTED_CATALOGUE` is the catalogue written down by hand. It owes nothing to the manifest, so
 *    a manifest that silently lost a product or a render fails against it.
 *  - The seed the repo would import is the second, and it is compared document by document. That is
 *    what makes a re-import provably a replacement rather than an edit.
 */

/**
 * Sizes and images live inside the product, so one filter serves the whole query.
 *
 * Two different meanings of "published" have to line up here. `status` is the catalogue's own
 * editorial field, which the import sets. The `path("drafts.**")` exclusion is Sanity's: opening a
 * product in the Studio and typing into it creates a `drafts.` twin that copies every field,
 * `status: "published"` included. Without the exclusion one Studio visit doubles a product, and the
 * verification reports six products and 33 sizes when the dataset holds five and 28.
 */
const PUBLISHED = '*[_type == "product" && status == "published" && !(_id in path("drafts.**"))]'

/**
 * The single query the verification runs, exported so the offline test exercises the exact string
 * the script sends to Sanity rather than a paraphrase of it.
 *
 * The totals are counted by GROQ itself — `count()` over the dataset — so they are the dataset's
 * answer, not a re-count of the projection below.
 */
export const CATALOGUE_QUERY = `{
  "products": ${PUBLISHED} | order(_id asc) {
    "id": _id,
    "slug": slug.current,
    "categoryIds": categories[]._ref,
    "specificationCount": coalesce(count(specifications), 0),
    "sizes": sizes[] {
      "key": _key,
      isDefault,
      isPoa,
      price,
      weightKg,
      heightM,
      "views": images[].view,
      "assetIds": images[].asset._ref,
      "resolvedAssetIds": images[].asset->_id
    }
  },
  "categories": *[_type == "category"] | order(_id asc) {
    "id": _id,
    "slug": slug.current,
    "parentId": parent._ref
  },
  "productCount": count(${PUBLISHED}),
  "sizeCount": count(${PUBLISHED}.sizes[]),
  "imageCount": count(${PUBLISHED}.sizes[].images[]),
  "distinctAssetCount": count(array::unique(${PUBLISHED}.sizes[].images[].asset._ref))
}`

/** A size as both the dataset and the seed describe it. */
export interface CatalogueSize {
  key: string
  isDefault: boolean
  isPoa: boolean
  price?: number
  weightKg: number
  heightM: number | null
  views: ProductImageView[]
  assetIds: string[]
}

export interface DatasetSize extends CatalogueSize {
  /** Dereferenced ids. A dangling reference yields nothing, or a `null` hole, depending on the engine. */
  resolvedAssetIds: Array<string | null>
}

export interface CatalogueProduct {
  id: string
  slug: string
  categoryIds: string[]
  specificationCount: number
  sizes: CatalogueSize[]
}

export interface DatasetProduct extends Omit<CatalogueProduct, 'sizes'> {
  sizes: DatasetSize[]
}

export interface DatasetCategory {
  id: string
  slug: string
  parentId?: string | null
}

export interface DatasetCatalogue {
  products: DatasetProduct[]
  categories: DatasetCategory[]
  productCount: number
  sizeCount: number
  imageCount: number
  distinctAssetCount: number
}

/** What one product family should amount to once imported. */
export interface ExpectedProduct {
  sizes: number
  images: number
  /** Whether the family sits under a subcategory and so must name its parent as well. */
  subcategory: boolean
  /** Owner-supplied weights, in size order. */
  weights: number[]
  /** Owner-supplied heights, in size order. */
  heights: number[]
}

/**
 * The finished catalogue, written down rather than derived.
 *
 * Deriving these from the manifest would make the verification agree with whatever the manifest
 * happens to say — including a manifest that has quietly dropped a size. Written by hand, they are
 * a second opinion, and the only numbers here that a code change cannot move on its own.
 *
 * Commercial data comes from the owner price request, independently encoded here so a manifest
 * edit cannot silently redefine its own expected totals or weights.
 */
export const EXPECTED_CATALOGUE: Record<string, ExpectedProduct> = {
  'grp-cabin': {
    sizes: 5,
    images: 23,
    subcategory: true,
    weights: [280, 350, 450, 550, 650],
    heights: [2.4, 2.4, 2.4, 2.4, 2.45]
  },
  'insulated-panel-cabin': {
    sizes: 5,
    images: 23,
    subcategory: true,
    weights: [100, 125, 225, 280, 380],
    heights: [2.35, 2.35, 2.35, 2.35, 2.35]
  },
  'metrocity-modular-cabin': {
    sizes: 5,
    images: 22,
    subcategory: true,
    weights: [700, 950, 1100, 1250, 1400],
    heights: [2.75, 2.75, 2.75, 2.75, 2.75]
  },
  'kompocity-composite-cabin': {
    sizes: 5,
    images: 20,
    subcategory: true,
    weights: [850, 1100, 1500, 1750, 1900],
    heights: [2.75, 2.75, 2.75, 2.75, 2.75]
  },
  'bulletproof-security-cabin': {
    sizes: 8,
    images: 32,
    subcategory: false,
    weights: [3000, 3800, 4500, 5800, 7500, 8000, 8800, 10500],
    heights: [3, 3, 3, 3, 3, 3, 3, 3]
  }
}

/**
 * References the catalogue holds beyond the number of assets behind them.
 *
 * The source publishes one door photograph for two MetroCity sizes. The files are byte-identical
 * and Sanity derives asset ids from the content hash, so 120 references sit over 119 assets. Stated
 * here so the shortfall is a declared property of the source data rather than a surprise.
 */
export const EXPECTED_SHARED_RENDERS = 1

function expectedTotal(field: 'sizes' | 'images'): number {
  return Object.values(EXPECTED_CATALOGUE).reduce((total, product) => total + product[field], 0)
}

/** One verified property. `detail` reads as the finding whether it passed or failed. */
export interface Check {
  name: string
  ok: boolean
  detail: string
}

function check(name: string, ok: boolean, detail: string): Check {
  return { name, ok, detail }
}

/**
 * JSON with every object's keys in a fixed order.
 *
 * Sanity returns projection fields alphabetically; groq-js returns them in the order the query
 * wrote them. A plain `JSON.stringify` comparison therefore agrees with the offline fixture and
 * reports every document as drifted against the real API — a difference of key order reported as a
 * difference of content, visible only in the one place it matters.
 */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(value, (_key, nested) =>
    nested !== null && typeof nested === 'object' && !Array.isArray(nested)
      ? Object.fromEntries(Object.entries(nested).sort(([a], [b]) => a.localeCompare(b)))
      : nested)
}

/** `a, b and c`, so a failure detail reads as a sentence rather than a dumped array. */
function list(items: readonly string[]): string {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

function imagesIn(product: CatalogueProduct): number {
  return product.sizes.reduce((total, size) => total + size.assetIds.length, 0)
}

/** Ids that actually dereferenced, with the holes a dangling reference leaves removed. */
function resolved(size: DatasetSize): string[] {
  return size.resolvedAssetIds.filter((id): id is string => typeof id === 'string')
}

/**
 * One size, carrying the product it belongs to and the label every failure names it by.
 *
 * The label is built once here because a finding that says "150x150" without saying whose is no
 * use — four of the five families have a size by that name or close to it.
 */
export interface SizeInCatalogue {
  product: CatalogueProduct
  size: CatalogueSize
  ref: string
}

function allSizes(products: readonly CatalogueProduct[]): SizeInCatalogue[] {
  return products.flatMap((product) =>
    product.sizes.map((size) => ({ product, size, ref: `${product.slug} ${size.key}` })))
}

/**
 * The dataset shape the seed documents would produce, so the two can be compared directly.
 *
 * This is what turns "the import is idempotent" into something checkable: a re-run that duplicated
 * a size, renumbered a key or pointed an image at another dataset's asset shows up as a difference
 * here even when every total still adds up.
 */
export function projectSeed(documents: readonly SeedProduct[]): CatalogueProduct[] {
  return documents
    .map((document) => ({
      id: document._id,
      slug: document.slug.current,
      categoryIds: document.categories.map((category) => category._ref),
      specificationCount: 0,
      sizes: document.sizes.map((size) => ({
        key: size._key,
        isDefault: size.isDefault,
        isPoa: size.isPoa,
        price: size.price,
        weightKg: size.weightKg,
        heightM: size.heightM ?? null,
        views: size.images.map((image) => image.view),
        assetIds: size.images.map((image) => image.asset._ref)
      }))
    }))
    .sort((a, b) => a.id.localeCompare(b.id))
}

/**
 * Totals, against the catalogue written down by hand rather than against the manifest.
 *
 * The per-family split is asserted, not merely reported: five products totalling 28 sizes could be
 * five families that have each quietly traded a size with another.
 */
function checkTotals(dataset: DatasetCatalogue): Check[] {
  const expectedSlugs = Object.keys(EXPECTED_CATALOGUE).sort()
  const actualSlugs = dataset.products.map((product) => product.slug).sort()

  const wrongSizes = dataset.products.filter(
    (product) => product.sizes.length !== EXPECTED_CATALOGUE[product.slug]?.sizes
  )
  const wrongImages = dataset.products.filter(
    (product) => imagesIn(product) !== EXPECTED_CATALOGUE[product.slug]?.images
  )

  const describe = (count: (product: DatasetProduct) => number) =>
    list(dataset.products.map((product) => `${product.slug} ${count(product)}`))

  return [
    check(
      'Published products',
      dataset.productCount === expectedSlugs.length && canonicalJson(actualSlugs) === canonicalJson(expectedSlugs),
      `${dataset.productCount} published, expected ${expectedSlugs.length}: ${list(actualSlugs)}`
    ),
    check(
      'Sizes, per family',
      dataset.sizeCount === expectedTotal('sizes') && wrongSizes.length === 0,
      `${dataset.sizeCount} sizes, expected ${expectedTotal('sizes')} — ${describe((product) => product.sizes.length)}`
    ),
    check(
      'Image references, per family',
      dataset.imageCount === expectedTotal('images') && wrongImages.length === 0,
      `${dataset.imageCount} image references, expected ${expectedTotal('images')} — ${describe(imagesIn)}`
    ),
    check(
      'Every image reference resolves to an asset',
      dataset.products.every((product) =>
        product.sizes.every((size) => resolved(size).length === size.assetIds.length)),
      list(
        allSizes(dataset.products)
          .filter((entry) => resolved(entry.size as DatasetSize).length !== entry.size.assetIds.length)
          .map((entry) => `${entry.ref} has a dangling asset reference`)
      ) || `all ${dataset.imageCount} references dereference to an image asset`
    )
  ]
}

/** Which sizes point at each asset, as `assetId -> ["slug key", ...]`, sorted so order cannot matter. */
function assetOwners(products: readonly CatalogueProduct[]): Map<string, string[]> {
  const owners = new Map<string, string[]>()
  for (const { size, ref } of allSizes(products)) {
    for (const assetId of size.assetIds) {
      owners.set(assetId, [...(owners.get(assetId) ?? []), ref].sort())
    }
  }
  return owners
}

/**
 * No size shows a render it does not own — the guarantee the ticket-01 restructure exists to give.
 *
 * Stated as a property rather than a rendering claim: each size's gallery is compared against the
 * one the seed built for it, so a size reaching another size's imagery shows up whether the two
 * belong to the same product or to different ones.
 *
 * Sharing an asset is not by itself the failure. Two byte-identical renders upload to a single
 * asset, because Sanity dedupes by content hash — the source publishes one door photograph for two
 * MetroCity sizes, and both sizes legitimately reference it. What must not happen is a share the
 * seed did not predict, or more shares than `EXPECTED_SHARED_RENDERS` declares.
 */
function checkImageryIsolation(expected: readonly CatalogueProduct[], dataset: DatasetCatalogue): Check[] {
  const owners = assetOwners(dataset.products)
  const expectedOwners = assetOwners(expected)

  const unexpected = [...owners.entries()].filter(
    ([assetId, sizes]) => canonicalJson(sizes) !== canonicalJson(expectedOwners.get(assetId) ?? [])
  )
  const shared = [...owners.entries()].filter(([, sizes]) => sizes.length > 1)

  return [
    check(
      'No size shows another size\'s render',
      unexpected.length === 0
      && shared.length === EXPECTED_SHARED_RENDERS
      && dataset.distinctAssetCount === dataset.imageCount - EXPECTED_SHARED_RENDERS,
      unexpected.length > 0
        ? list(unexpected.map(([assetId, sizes]) => `${assetId} is used by ${list(sizes)}`))
        : `${dataset.imageCount} references over ${dataset.distinctAssetCount} assets; `
          + `${shared.length} render(s) shared, ${EXPECTED_SHARED_RENDERS} expected`
          + (shared.length === 0
            ? ''
            : ` — ${list(shared.map(([, sizes]) => list(sizes)))}, byte-identical files the source `
              + 'publishes twice')
    )
  ]
}

function checkIntegrity(dataset: DatasetCatalogue): Check[] {
  const sizes = allSizes(dataset.products)
  const isPortableContainer = (product: CatalogueProduct) =>
    product.categoryIds.includes('category-containers')

  const wrongDefaults = dataset.products.filter((product) =>
    !isPortableContainer(product) && product.sizes.filter((size) => size.isDefault).length !== 1
  )
  const wrongPlans = sizes.filter((entry) =>
    !isPortableContainer(entry.product)
    && entry.size.views.filter((view) => view === PLAN_VIEW).length !== 1
  )

  const slugCounts = new Map<string, number>()
  for (const product of dataset.products) {
    slugCounts.set(product.slug, (slugCounts.get(product.slug) ?? 0) + 1)
  }
  const duplicateSlugs = [...slugCounts.entries()].filter(([, count]) => count > 1).map(([slug]) => slug)

  const categorySlugs = new Set(dataset.categories.map((category) => category.slug))
  const collidingSlugs = dataset.products.map((product) => product.slug).filter((slug) => categorySlugs.has(slug))

  const withoutFixedPrice = sizes.filter((entry) =>
    !isPortableContainer(entry.product)
    && (entry.size.isPoa || entry.size.price === undefined || entry.size.price <= 0)
  )

  return [
    check(
      'Exactly one default size per product',
      wrongDefaults.length === 0,
      wrongDefaults.length === 0
        ? list(dataset.products.filter((product) => !isPortableContainer(product)).map((product) =>
          `${product.slug} ${product.sizes.find((size) => size.isDefault)!.key}`))
        : list(wrongDefaults.map((product) =>
          `${product.slug} has ${product.sizes.filter((size) => size.isDefault).length} defaults`))
    ),
    check(
      'Exactly one plan view per size',
      wrongPlans.length === 0,
      wrongPlans.length === 0
        ? `all ${sizes.filter((entry) => !isPortableContainer(entry.product)).length} non-portable sizes carry one "${PLAN_VIEW}" render`
        : list(wrongPlans.map((entry) => entry.ref))
    ),
    check(
      'Product slugs are unique',
      duplicateSlugs.length === 0,
      duplicateSlugs.length === 0 ? `${dataset.products.length} distinct slugs` : list(duplicateSlugs)
    ),
    check(
      'No product slug collides with a category slug',
      collidingSlugs.length === 0,
      collidingSlugs.length === 0
        ? `checked against ${dataset.categories.length} category slugs: ${list([...categorySlugs].sort())}`
        : list(collidingSlugs.map((slug) => `"${slug}" is also a category slug`))
    ),
    check(
      'Every size has an owner-supplied fixed price',
      withoutFixedPrice.length === 0,
      withoutFixedPrice.length === 0
        ? `all ${sizes.filter((entry) => !isPortableContainer(entry.product)).length} non-portable sizes carry a positive fixed price`
        : list(withoutFixedPrice.map((entry) =>
          `${entry.ref} (isPoa ${entry.size.isPoa}, price ${entry.size.price})`))
    )
  ]
}

/**
 * Category references resolve, and the families declared to sit under a subcategory do so.
 *
 * Checking only the products that already name a subcategory would pass a product that had lost
 * one, which is why `EXPECTED_CATALOGUE` says which four are meant to have one. The parent is
 * carried alongside the subcategory rather than inferred, so a `references()` query resolves the
 * product at either level; checking both is what stops that duplication going stale.
 */
function checkCategories(dataset: DatasetCatalogue): Check[] {
  const byId = new Map(dataset.categories.map((category) => [category.id, category]))

  const dangling = dataset.products.flatMap((product) =>
    product.categoryIds
      .filter((categoryId) => !byId.has(categoryId))
      .map((categoryId) => `${product.slug} -> ${categoryId}`)
  )

  const subcategoryProblems = dataset.products.flatMap((product) => {
    const subcategory = product.categoryIds
      .map((categoryId) => byId.get(categoryId))
      .find((category) => category?.parentId)
    const shouldHaveOne = EXPECTED_CATALOGUE[product.slug]?.subcategory ?? false

    if (!subcategory) {
      return shouldHaveOne ? [`${product.slug} sits under no subcategory`] : []
    }
    if (!shouldHaveOne) return [`${product.slug} unexpectedly sits under ${subcategory.slug}`]

    return product.categoryIds.includes(subcategory.parentId!)
      ? []
      : [`${product.slug} names ${subcategory.slug} without its parent`]
  })

  const expectedSubcategories = Object.values(EXPECTED_CATALOGUE).filter((one) => one.subcategory).length

  return [
    check(
      'Every category reference resolves',
      dangling.length === 0,
      dangling.length === 0
        ? list(dataset.products.map((product) =>
          `${product.slug} -> ${list(product.categoryIds.map((id) => byId.get(id)!.slug))}`))
        : list(dangling)
    ),
    check(
      'Subcategory products also reference their parent',
      subcategoryProblems.length === 0,
      subcategoryProblems.length === 0
        ? `${expectedSubcategories} of ${dataset.products.length} products sit under a subcategory, `
          + 'each naming its parent too'
        : list(subcategoryProblems)
    )
  ]
}

/**
 * Owner-supplied physical details and deliberately empty specification tables.
 *
 * Weights are compared against `EXPECTED_CATALOGUE` rather than the seed, so a value invented in
 * the manifest fails rather than becoming its own expectation.
 */
function checkCommercialDetails(dataset: DatasetCatalogue): Check[] {
  const sizes = allSizes(dataset.products)

  const wrongWeights = dataset.products.filter((product) =>
    canonicalJson(product.sizes.map((size) => size.weightKg).filter((weight) => weight > 0))
    !== canonicalJson(EXPECTED_CATALOGUE[product.slug]?.weights ?? [])
  )
  const wrongHeights = dataset.products.filter((product) =>
    canonicalJson(product.sizes.map((size) => size.heightM))
    !== canonicalJson(EXPECTED_CATALOGUE[product.slug]?.heights ?? [])
  )
  const weighted = sizes.filter((entry) => entry.size.weightKg > 0)
  const withHeight = sizes.filter((entry) => typeof entry.size.heightM === 'number')
  const withSpecs = dataset.products.filter((product) => product.specificationCount > 0)

  return [
    check(
      'Owner-supplied weight on every size',
      wrongWeights.length === 0,
      wrongWeights.length > 0
        ? list(wrongWeights.map((product) => `${product.slug} publishes unexpected weights`))
        : `${weighted.length} of ${sizes.length} sizes carry an owner-supplied weight`
    ),
    check(
      'Owner-supplied height on every size',
      wrongHeights.length === 0,
      wrongHeights.length > 0
        ? list(wrongHeights.map((product) => `${product.slug} publishes unexpected heights`))
        : `${withHeight.length} of ${sizes.length} sizes carry the expected owner-supplied height`
    ),
    check(
      'specifications[] is empty on every product, by decision',
      withSpecs.length === 0,
      withSpecs.length === 0
        ? `all ${dataset.products.length} products publish no specification rows`
        : list(withSpecs.map((product) => `${product.slug} has ${product.specificationCount}`))
    )
  ]
}

/**
 * The dataset holds exactly what the seed says it should — no more, no less, no drift.
 *
 * This is the idempotence guard. Every id and `_key` in the seed is derived, so importing twice
 * should be indistinguishable from importing once; if a re-run duplicated a size, renamed a key or
 * left a stale document behind, the totals above can still agree while this fails.
 */
function checkNoDrift(expected: readonly CatalogueProduct[], dataset: DatasetCatalogue): Check[] {
  const differences: string[] = []
  const datasetById = new Map(dataset.products.map((product) => [product.id, product]))

  // Reference *resolution* is `checkTotals`' business; this one is about content, and a dangling
  // asset should not be reported twice under two different names.
  const withoutResolution = (product: CatalogueProduct) => canonicalJson({
    ...product,
    sizes: product.sizes.map(({ ...size }) => {
      delete (size as Partial<DatasetSize>).resolvedAssetIds
      return size
    })
  })

  for (const product of expected) {
    const actual = datasetById.get(product.id)
    if (!actual) {
      differences.push(`${product.slug} is missing from the dataset`)
      continue
    }
    if (withoutResolution(actual) !== withoutResolution(product)) {
      differences.push(`${product.slug} differs from the seed`)
    }
  }

  const expectedIds = new Set(expected.map((product) => product.id))
  for (const product of dataset.products) {
    if (!expectedIds.has(product.id)) differences.push(`${product.slug} is in the dataset but not the seed`)
  }

  return [
    check(
      'Dataset matches the seed the import would write',
      differences.length === 0,
      differences.length === 0
        ? `${expected.length} products identical to ${SEED_FILE}, `
          + 'so a re-import is a replacement rather than an edit'
        : list(differences)
    )
  ]
}

/**
 * Verify the catalogue in a dataset against `EXPECTED_CATALOGUE` and against the seed the repo
 * would import into it.
 *
 * Returns every check rather than stopping at the first failure: the point of this pass is a
 * report a human can read before promoting to production, and a list truncated at the first
 * problem hides the rest of the picture.
 */
export function verifyCatalogue(
  seedDocuments: readonly SeedProduct[],
  dataset: DatasetCatalogue
): Check[] {
  const expected = projectSeed(seedDocuments)

  return [
    ...checkTotals(dataset),
    ...checkImageryIsolation(expected, dataset),
    ...checkIntegrity(dataset),
    ...checkCategories(dataset),
    ...checkCommercialDetails(dataset),
    ...checkNoDrift(expected, dataset)
  ]
}

/** Render paths the asset manifest maps onto a single asset id. */
export function sharedRenders(assets: AssetManifest): Array<{ assetId: string, paths: string[] }> {
  const byAsset = new Map<string, string[]>()
  for (const [path, assetId] of Object.entries(assets.assets)) {
    byAsset.set(assetId, [...(byAsset.get(assetId) ?? []), path])
  }
  return [...byAsset.entries()]
    .filter(([, paths]) => paths.length > 1)
    .map(([assetId, paths]) => ({ assetId, paths: paths.sort() }))
}

/**
 * Two renders may share an asset only when they are the same picture.
 *
 * Sanity derives an asset id from the file's content hash, so a legitimate share is always
 * byte-identical files. The failure this guards is the hand edit: the asset manifest is a plain
 * committed JSON file, and pointing two paths at one id there would silently give one size another
 * size's render with nothing in the dataset to distinguish it from the deliberate duplicate.
 */
export function checkSharedRenders(
  assets: AssetManifest,
  hashRender: (renderPath: string) => string
): Check {
  const groups = sharedRenders(assets)
  const mismatched = groups.filter(({ paths }) => new Set(paths.map(hashRender)).size > 1)

  return check(
    'Renders sharing an asset are byte-identical',
    mismatched.length === 0 && groups.length === EXPECTED_SHARED_RENDERS,
    mismatched.length > 0
      ? list(mismatched.map(({ assetId, paths }) => `${list(paths)} differ but both map to ${assetId}`))
      : `${groups.length} share(s), ${EXPECTED_SHARED_RENDERS} expected`
        + (groups.length === 0 ? '' : `: ${list(groups.map(({ paths }) => `${list(paths)} are one file`))}`)
  )
}

export function formatChecks(checks: readonly Check[]): string {
  return checks.map((entry) => `${entry.ok ? '✓' : '✗'} ${entry.name}\n    ${entry.detail}`).join('\n')
}
