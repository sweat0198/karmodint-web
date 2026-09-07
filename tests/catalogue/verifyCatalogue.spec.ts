import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import { hashRender, loadAssetManifest } from '../../scripts/catalogue/lib/assets'
import { loadManifest, readRenderFolder } from '../../scripts/catalogue/lib/manifest'
import { loadCopyFile } from '../../scripts/catalogue/lib/copy'
import { buildCatalogueSeed, type SeedProduct } from '../../scripts/catalogue/lib/buildSeed'
import {
  CATALOGUE_QUERY,
  checkSharedRenders,
  EXPECTED_CATALOGUE,
  EXPECTED_SHARED_RENDERS,
  sharedRenders,
  verifyCatalogue,
  type Check,
  type DatasetCatalogue,
  type DatasetProduct
} from '../../scripts/catalogue/lib/verifyCatalogue'
import { repoPath } from '../../scripts/catalogue/lib/paths'
import { executeGroq } from '../utils/groqRunner'

const manifest = loadManifest()
const assets = loadAssetManifest('dev')
const seed = buildCatalogueSeed(manifest, loadCopyFile, assets)

const CATEGORY_SEEDS = ['categories', 'cabin-subcategories']

/** Anything the fixture dataset can hold: a seed product, a category seed, an asset stub. */
type FixtureDocument = SeedProduct | { _id: string, _type: string, [field: string]: unknown }

function readNdjson(name: string): FixtureDocument[] {
  return fs.readFileSync(repoPath(`sanity/seeds/${name}.ndjson`), 'utf-8')
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line) as FixtureDocument)
}

/**
 * A stand-in dataset: the documents the import writes, the category seeds they reference, and one
 * asset document per uploaded render.
 *
 * Running the real `CATALOGUE_QUERY` over this is what makes the query itself testable — the script
 * sends the same string to Sanity, so a projection that names a field wrong fails here rather than
 * in production.
 */
function datasetDocuments(products: SeedProduct[] = seed): FixtureDocument[] {
  const assetIds = new Set(
    products.flatMap((product) =>
      product.sizes.flatMap((size) => size.images.map((image) => image.asset._ref)))
  )
  return [
    ...products,
    ...CATEGORY_SEEDS.flatMap(readNdjson),
    ...[...assetIds].map((id) => ({ _id: id, _type: 'sanity.imageAsset' }))
  ]
}

function queryCatalogue(documents: FixtureDocument[]): Promise<DatasetCatalogue> {
  return executeGroq<DatasetCatalogue>(CATALOGUE_QUERY, {}, documents)
}

function clone(products: SeedProduct[] = seed): SeedProduct[] {
  return JSON.parse(JSON.stringify(products)) as SeedProduct[]
}

function productIn(products: SeedProduct[], slug: string): SeedProduct {
  return products.find((product) => product.slug.current === slug)!
}

function failures(checks: Check[]): string[] {
  return checks.filter((check) => !check.ok).map((check) => check.name)
}

function checkNamed(checks: Check[], name: string): Check {
  return checks.find((check) => check.name.startsWith(name))!
}

/** Same object, keys in the opposite order — which is all a different GROQ engine changes. */
function shuffleKeys<T extends object>(value: T): T {
  return Object.fromEntries(Object.entries(value).reverse()) as T
}

const committed = await queryCatalogue(datasetDocuments())
const committedChecks = verifyCatalogue(seed, committed)

describe('The catalogue as a whole', () => {
  it('passes every check', () => {
    expect(failures(committedChecks)).toEqual([])
  })

  it('declares the five families the ticket describes, with one shared render', () => {
    // These literals are the second opinion the dataset is held against. If they ever have to be
    // edited to make a run pass, that edit is the thing to review.
    expect(EXPECTED_CATALOGUE).toEqual({
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
    })
    expect(EXPECTED_SHARED_RENDERS).toBe(1)
  })

  it('holds five products, twenty-eight sizes and one hundred and twenty image references', () => {
    expect(committed.productCount).toBe(5)
    expect(committed.sizeCount).toBe(28)
    expect(committed.imageCount).toBe(120)
  })

  it('splits those sizes and images the way the five families do', () => {
    expect(
      Object.fromEntries(committed.products.map((product) => [
        product.slug,
        [product.sizes.length, product.sizes.reduce((total, size) => total + size.assetIds.length, 0)]
      ]))
    ).toEqual({
      'grp-cabin': [5, 23],
      'insulated-panel-cabin': [5, 23],
      'metrocity-modular-cabin': [5, 22],
      'kompocity-composite-cabin': [5, 20],
      'bulletproof-security-cabin': [8, 32]
    })
  })

  it('accounts for every render in the twenty-eight folders, with none orphaned', () => {
    const onDisk = manifest.products.reduce(
      (total, product) => total + product.sizes.reduce(
        (sum, size) => sum + (readRenderFolder(manifest, size.renderFolder)?.views.length ?? 0),
        0
      ),
      0
    )
    expect(onDisk).toBe(120)
    expect(committed.imageCount).toBe(onDisk)
  })

  it('spreads those 120 references over 119 assets, the one duplicate being a repeated source file', () => {
    // The source publishes the same door photograph for two MetroCity sizes. Sanity derives asset
    // ids from the content hash, so the byte-identical pair uploads once — a property of the source
    // data, not of the import.
    expect(committed.distinctAssetCount).toBe(119)

    const shared = sharedRenders(assets)
    expect(shared.map(({ paths }) => paths)).toEqual([[
      'public/images/products/cabin-metro-city-140x140/door.png',
      'public/images/products/cabin-metro-city-140x215/door.png'
    ]])
  })

  it('backs that duplicate with files that really are identical', () => {
    expect(checkSharedRenders(assets, hashRender).ok).toBe(true)
  })

  it('refuses an asset manifest that maps two different renders onto one asset', () => {
    // The asset manifest is hand-editable, so this is the one way two sizes could come to share a
    // render without the files matching.
    const forged = {
      dataset: 'dev',
      assets: {
        ...assets.assets,
        'public/images/products/cabin-grp-150x150/front.png':
          assets.assets['public/images/products/cabin-grp-150x215/front.png']
      }
    }
    const result = checkSharedRenders(forged, hashRender)
    expect(result.ok).toBe(false)
    expect(result.detail).toContain('differ but both map to')
  })

  it('reads owner-supplied weights and heights on all 28 sizes', () => {
    const weighted = committed.products.flatMap((product) =>
      product.sizes.filter((size) => size.weightKg > 0).map((size) => [product.slug, size.weightKg]))
    expect(weighted).toHaveLength(28)
    expect(committed.products.flatMap((product) => product.sizes).filter((size) => size.heightM !== null))
      .toHaveLength(28)
  })

  it('reads the same however the API orders its projection keys', () => {
    // Sanity returns projection fields alphabetically; groq-js returns them as written. Without a
    // canonical comparison the drift check passes on this fixture and fails on every real document.
    const reordered: DatasetCatalogue = {
      ...committed,
      products: committed.products.map((product) => ({
        ...shuffleKeys(product),
        sizes: product.sizes.map(shuffleKeys)
      }))
    }
    expect(failures(verifyCatalogue(seed, reordered))).toEqual([])
  })

  it('keeps every product slug clear of the five category slugs', () => {
    // Full-name product slugs were chosen for exactly this reason — `grp-cabin`, not `grp`.
    const categorySlugs = new Set(committed.categories.map((category) => category.slug))
    for (const slug of ['grp', 'panel', 'metro-city', 'composite', 'bulletproof']) {
      expect(categorySlugs.has(slug)).toBe(true)
    }
    expect(checkNamed(committedChecks, 'No product slug collides').ok).toBe(true)
  })
})


/**
 * Each of these drifts the *dataset* while leaving the repo's seed untouched, which is the shape a
 * real problem takes: a Studio edit, a half-finished import, a document nobody deleted.
 */
describe('Catalogue verification', () => {
  async function checksFor(drift: (products: SeedProduct[]) => SeedProduct[] | void): Promise<Check[]> {
    const products = clone()
    const drifted = drift(products) ?? products
    return verifyCatalogue(seed, await queryCatalogue(datasetDocuments(drifted)))
  }

  it('ignores the draft twin a Studio visit leaves behind', async () => {
    // Editing a product in the Studio creates a `drafts.` copy carrying every field, including
    // `status: "published"`. Counting it doubled a product and reported 33 sizes against a dataset
    // holding 28 — found against the real dev dataset, not here.
    const draft: FixtureDocument = {
      ...clone([productIn(clone(), 'grp-cabin')])[0],
      _id: 'drafts.product-grp-cabin'
    }

    const checks = verifyCatalogue(seed, await queryCatalogue([...datasetDocuments(), draft]))
    expect(failures(checks)).toEqual([])
  })

  it('catches a size the manifest and the dataset have lost together', async () => {
    // The failure a seed-derived expectation cannot see: drop a size from the manifest and the
    // dataset agrees with it perfectly. Only the hand-written EXPECTED_CATALOGUE disagrees.
    const shrunk = clone()
    productIn(shrunk, 'metrocity-modular-cabin').sizes.splice(4, 1)

    const checks = verifyCatalogue(shrunk, await queryCatalogue(datasetDocuments(shrunk)))
    expect(failures(checks)).toContain('Sizes, per family')
    expect(failures(checks)).toContain('Image references, per family')
    expect(checkNamed(checks, 'Dataset matches').ok).toBe(true)
  })

  it('catches a family that has traded a size with another family', async () => {
    // Totals alone would still read 28. The per-family split is what notices.
    const traded = clone()
    const [size] = productIn(traded, 'kompocity-composite-cabin').sizes.splice(4, 1)
    productIn(traded, 'metrocity-modular-cabin').sizes.push(size)

    const checks = verifyCatalogue(traded, await queryCatalogue(datasetDocuments(traded)))
    expect(failures(checks)).toContain('Sizes, per family')
  })

  it('catches a size showing another size\'s render', async () => {
    const checks = await checksFor((products) => {
      const grp = productIn(products, 'grp-cabin')
      grp.sizes[1].images[0].asset._ref = grp.sizes[0].images[0].asset._ref
    })

    expect(failures(checks)).toContain('No size shows another size\'s render')
    expect(checkNamed(checks, 'No size shows').detail).toContain('grp-cabin 150x150')
    expect(checkNamed(checks, 'No size shows').detail).toContain('grp-cabin 150x215')
  })

  it('catches a size showing a render belonging to a different product', async () => {
    const checks = await checksFor((products) => {
      productIn(products, 'insulated-panel-cabin').sizes[0].images[0].asset._ref
        = productIn(products, 'grp-cabin').sizes[0].images[0].asset._ref
    })

    expect(failures(checks)).toContain('No size shows another size\'s render')
  })

  it('catches a product with two default sizes', async () => {
    const checks = await checksFor((products) => {
      productIn(products, 'bulletproof-security-cabin').sizes[0].isDefault = true
    })

    expect(failures(checks)).toContain('Exactly one default size per product')
    expect(checkNamed(checks, 'Exactly one default').detail).toContain('2 defaults')
  })

  it('catches a size with no plan view', async () => {
    const checks = await checksFor((products) => {
      const size = productIn(products, 'metrocity-modular-cabin').sizes[2]
      size.images = size.images.filter((image) => image.view !== 'top')
    })

    expect(failures(checks)).toContain('Exactly one plan view per size')
  })

  it('catches a product slug that collides with a category slug', async () => {
    const checks = await checksFor((products) => {
      productIn(products, 'insulated-panel-cabin').slug.current = 'panel'
    })

    expect(failures(checks)).toContain('No product slug collides with a category slug')
    expect(checkNamed(checks, 'No product slug collides').detail).toContain('"panel" is also a category slug')
  })

  it('catches two products that have come to share a slug', async () => {
    const checks = await checksFor((products) => {
      productIn(products, 'kompocity-composite-cabin').slug.current = 'grp-cabin'
    })

    expect(failures(checks)).toContain('Product slugs are unique')
  })

  it('catches a category reference that resolves to nothing', async () => {
    const checks = await checksFor((products) => {
      productIn(products, 'grp-cabin').categories[1]._ref = 'category-cabin-fibreglass'
    })

    expect(failures(checks)).toContain('Every category reference resolves')
    expect(checkNamed(checks, 'Every category reference').detail)
      .toContain('grp-cabin -> category-cabin-fibreglass')
  })

  it('catches a subcategory product that has lost its parent reference', async () => {
    const checks = await checksFor((products) => {
      const grp = productIn(products, 'grp-cabin')
      grp.categories = grp.categories.filter((category) => category._ref !== 'category-cabin')
    })

    expect(failures(checks)).toContain('Subcategory products also reference their parent')
  })

  it('catches an image pointing at an asset the dataset does not hold', async () => {
    const missing = seed[0].sizes[0].images[0].asset._ref
    const documents = datasetDocuments().filter((document) => document._id !== missing)

    const checks = verifyCatalogue(seed, await queryCatalogue(documents))
    expect(failures(checks)).toContain('Every image reference resolves to an asset')
  })

  it('catches a size that has lost its fixed price', async () => {
    const checks = await checksFor((products) => {
      const size = productIn(products, 'kompocity-composite-cabin').sizes[0]
      size.isPoa = true
      size.price = 0
    })

    expect(failures(checks)).toContain('Every size has an owner-supplied fixed price')
  })

  it('catches a weight that has appeared without passing through the manifest', async () => {
    const checks = await checksFor((products) => {
      productIn(products, 'bulletproof-security-cabin').sizes[0].weightKg = 900
    })

    expect(failures(checks)).toContain('Owner-supplied weight on every size')
  })

  it('catches an incorrect owner-supplied height', async () => {
    const checks = await checksFor((products) => {
      productIn(products, 'bulletproof-security-cabin').sizes[0].heightM = 99
    })

    expect(failures(checks)).toContain('Owner-supplied height on every size')
  })

  it('catches a specification table someone has started filling in by hand', async () => {
    const checks = await checksFor((products) => {
      const grp: SeedProduct & { specifications?: unknown[] } = productIn(products, 'grp-cabin')
      grp.specifications = [{ _key: 'a', label: 'Walls', value: 'GRP' }]
    })

    expect(failures(checks)).toContain('specifications[] is empty on every product, by decision')
  })

  it('catches a leftover product the seed no longer names', async () => {
    const checks = await checksFor((products) => [
      ...products,
      { ...clone()[0], _id: 'product-grp-cabin-old' }
    ])

    expect(failures(checks)).toContain('Dataset matches the seed the import would write')
    expect(checkNamed(checks, 'Dataset matches').detail).toContain('is in the dataset but not the seed')
  })

  it('catches a size key renumbered in the dataset, which a re-import would duplicate rather than replace', async () => {
    const checks = await checksFor((products) => {
      productIn(products, 'grp-cabin').sizes[0]._key = '150x151'
    })

    expect(failures(checks)).toContain('Dataset matches the seed the import would write')
    expect(checkNamed(checks, 'Dataset matches').detail).toContain('grp-cabin differs from the seed')
  })

  it('catches a product missing from the dataset entirely', async () => {
    const checks = await checksFor((products) =>
      products.filter((product) => product.slug.current !== 'bulletproof-security-cabin'))

    expect(failures(checks)).toContain('Published products')
    expect(checkNamed(checks, 'Dataset matches').detail)
      .toContain('bulletproof-security-cabin is missing from the dataset')
  })
})
