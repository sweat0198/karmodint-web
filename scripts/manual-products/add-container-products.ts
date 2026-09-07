/**
 * Create/replace hand-sourced container products directly in Sanity.
 *
 * The karmodkabin.com scrape pipeline in `scripts/catalogue/` verifies a closed set of five scraped
 * families (see `EXPECTED_CATALOGUE` in `scripts/catalogue/lib/verifyCatalogue.ts`) and is not the
 * right tool for a product sourced one-off from elsewhere (a local render folder, a marketplace
 * listing) — it would force every new addition through manifest rows, a scraper source list and a
 * hand-typed total that describes "the five families" by design. This script instead builds and
 * writes one product document per entry in `CONTAINER_PRODUCTS` below, reusing the catalogue
 * pipeline's schema-shape helpers (alt text templating, markdown -> Portable Text) without
 * participating in its manifest or verification.
 *
 * Renders are read from `public/images/products/<renderFolder>/<view>.png`, matching the same
 * view-vocabulary filenames the scraped pipeline uses. Sanity dedupes uploads by content hash, so
 * re-running this script re-attaches the same assets rather than duplicating them.
 *
 *   pnpm products:containers --dry-run
 *   pnpm products:containers
 */
import fs from 'node:fs'
import { renderAltText } from '../catalogue/lib/altText'
import { sizeLabel } from '../catalogue/lib/manifest'
import { markdownToPortableText, validatePortableText } from '../catalogue/lib/portableText'
import { repoPath } from '../catalogue/lib/paths'
import { runScript } from '../catalogue/lib/runScript'
import { createSanityClient, readDataset, readSanityTarget } from '../catalogue/lib/sanityEnv'
import type { ProductImageView } from '../../sanity/schemas/objects/productImageViews'

const RENDER_ROOT = 'public/images/products'

interface ManualSize {
  key: string
  lengthM: number
  widthM: number
  heightM?: number
  weightKg: number
  isPoa: boolean
  price: number
  isDefault: boolean
  renderFolder: string
  views: ProductImageView[]
  /** Provenance only — where the dimensions/spec came from. Not written to the document. */
  sourceUrl: string
}

interface ManualProduct {
  id: string
  name: string
  slug: string
  shortDescription: string
  seoTitle: string
  seoDescription: string
  isFeatured: boolean
  categories: string[]
  bodyMarkdown: string
  sizes: ManualSize[]
}

/**
 * K1002: 3.00m × 7.00m, renders already staged locally. No confirmed sell price yet, so the size is
 * POA rather than carrying an invented figure — see `sizeOption.isPoa`.
 */
export const CONTAINER_PRODUCTS: ManualProduct[] = [
  {
    id: 'product-k1002-portable-cabin',
    name: 'K1002 Portable Cabin',
    slug: 'k1002-portable-cabin',
    shortDescription:
      'A 3.00m × 7.00m sandwich-panel portable cabin with a central door and twin windows, ready to site as an office, store or welfare unit.',
    seoTitle: 'K1002 Portable Cabin | 3m × 7m Site Cabin',
    seoDescription:
      'The K1002 is a 3.00m × 7.00m insulated sandwich-panel portable cabin with a central entrance door and two windows, suited to site offices, storage and welfare use.',
    isFeatured: false,
    categories: ['category-containers'],
    bodyMarkdown: `## A single-piece cabin built for the wider footprint

The K1002 is a 3.00m × 7.00m portable cabin, built from insulated sandwich panel on a steel
chassis. The extra length over Karmod's smaller cabins gives room to split the interior into more
than one working area, while the unit still arrives and leaves as a single piece.

## Layout

A centred entrance door sits between two windows, one at each end of the cabin, so both halves of
the interior get natural light. The panel construction and steel frame follow the same build as the
rest of the range, insulated for year-round use.

## Where the K1002 fits

- **Site offices** needing more desk space than a single-room cabin allows.
- **Storage** for tools, plant and materials where a wider unit reduces the number of units needed
  on site.
- **Welfare and break rooms**, where the additional length suits a kitchen area alongside seating.

Delivered ready for use — placement on site is the only step before it is in service.`,
    sizes: [
      {
        key: '300x700',
        lengthM: 3,
        widthM: 7,
        weightKg: 0,
        isPoa: true,
        price: 0,
        isDefault: true,
        renderFolder: 'K1002',
        views: ['front', 'left-diagonal', 'right', 'top'],
        sourceUrl: 'https://www.ebay.co.uk/itm/297827911885'
      }
    ]
  }
]

function renderPath(renderFolder: string, view: ProductImageView): string {
  return `${RENDER_ROOT}/${renderFolder}/${view}.png`
}

function validateProducts(products: ManualProduct[]): string[] {
  const problems: string[] = []

  for (const product of products) {
    const defaults = product.sizes.filter((size) => size.isDefault)
    if (defaults.length !== 1) {
      problems.push(`${product.id} must have exactly one default size (found ${defaults.length})`)
    }

    for (const size of product.sizes) {
      const where = `${product.id} size "${size.key}"`

      if (!size.views.includes('top')) {
        problems.push(`${where} has no "top" (plan) view`)
      }
      if (size.isPoa && size.price !== 0) {
        problems.push(`${where} is POA, so its placeholder price must be 0 (found ${size.price})`)
      }

      for (const view of size.views) {
        const filePath = renderPath(size.renderFolder, view)
        if (!fs.existsSync(repoPath(filePath))) {
          problems.push(`${where} references "${filePath}", which does not exist`)
        }
      }
    }
  }

  return problems
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run')
  const dataset = dryRun ? readDataset() : readSanityTarget().dataset

  const problems = validateProducts(CONTAINER_PRODUCTS)
  if (problems.length > 0) {
    throw new Error(`Container product data is invalid:\n  ${problems.join('\n  ')}`)
  }

  console.log(
    `${CONTAINER_PRODUCTS.length} product(s) targeting "${dataset}"`
    + `${dryRun ? ' (dry run — no network write)' : ''}`
  )

  if (dryRun) {
    for (const product of CONTAINER_PRODUCTS) {
      const renders = product.sizes.flatMap((size) => size.views.map((view) => renderPath(size.renderFolder, view)))
      console.log(`would create/replace ${product.id} (${renders.length} render(s))`)
    }
    return
  }

  const client = createSanityClient(readSanityTarget())

  for (const product of CONTAINER_PRODUCTS) {
    const description = markdownToPortableText(product.bodyMarkdown, product.slug)
    const problemsInBody = validatePortableText(description)
    if (problemsInBody.length > 0) {
      throw new Error(`${product.id} body converts to Portable Text outside the whitelist:\n  ${problemsInBody.join('\n  ')}`)
    }

    const sizes = []
    for (const size of product.sizes) {
      const label = sizeLabel(size)
      const images = []
      for (const view of size.views) {
        const filePath = renderPath(size.renderFolder, view)
        const asset = await client.assets.upload('image', fs.createReadStream(repoPath(filePath)), {
          filename: filePath.split('/').slice(-2).join('-')
        })
        console.log(`uploaded  ${filePath} -> ${asset._id}`)
        images.push({
          _key: view,
          _type: 'image' as const,
          view,
          alt: renderAltText(product.name, label, view),
          asset: { _type: 'reference' as const, _ref: asset._id }
        })
      }

      sizes.push({
        _key: size.key,
        _type: 'sizeOption' as const,
        label,
        lengthM: size.lengthM,
        widthM: size.widthM,
        ...(size.heightM === undefined ? {} : { heightM: size.heightM }),
        weightKg: size.weightKg,
        isPoa: size.isPoa,
        price: size.price,
        isDefault: size.isDefault,
        images
      })
    }

    const document = {
      _id: product.id,
      _type: 'product' as const,
      name: product.name,
      slug: { _type: 'slug' as const, current: product.slug },
      shortDescription: product.shortDescription,
      description,
      categories: product.categories.map((categoryId) => ({
        _key: categoryId,
        _type: 'reference' as const,
        _ref: categoryId
      })),
      sizes,
      isFeatured: product.isFeatured,
      status: 'published' as const,
      seo: {
        _type: 'seo' as const,
        metaTitle: product.seoTitle,
        metaDescription: product.seoDescription
      }
    }

    await client.createOrReplace(document)
    console.log(`created/replaced ${product.id} in "${dataset}"`)
  }
}

runScript(main)
