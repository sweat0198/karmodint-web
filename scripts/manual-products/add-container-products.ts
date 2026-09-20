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
 *   pnpm manual-products:containers --dry-run
 *   pnpm manual-products:containers
 *   pnpm manual-products:containers --update-existing
 */
import fs from 'node:fs'
import { pathToFileURL } from 'node:url'
import { containerCustomizationConfigurations } from '../customizations/lib/seedRecipes'
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
 * Confirmed prices exclude VAT. The storefront adds the shared "+ VAT" label.
 */
export const CONTAINER_PRODUCTS: ManualProduct[] = [
  {
    id: 'product-k1002-portable-cabin',
    name: 'Portable Cabin',
    slug: 'k1002-portable-cabin',
    shortDescription:
      'A sandwich-panel portable cabin available in 2.30m × 6.00m, 3.00m × 5.00m, 3.00m × 6.00m and 3.00m × 7.00m sizes with a central door and twin windows, ready to site as an office, store or welfare unit.',
    seoTitle: 'Portable Cabin | Site Offices, Storage & Welfare',
    seoDescription:
      'An insulated sandwich-panel portable cabin in four sizes from 2.30m × 6.00m to 3.00m × 7.00m with a central entrance door and two windows, suited to site offices, storage and welfare use.',
    isFeatured: false,
    categories: ['category-containers'],
    bodyMarkdown: `## A single-piece cabin in four sizes

The Portable Cabin is built from insulated sandwich panel on a steel chassis. Choose from
2.30m × 6.00m, 3.00m × 5.00m, 3.00m × 6.00m and 3.00m × 7.00m footprints to suit your site.
The unit arrives and leaves as a single piece.

## Layout

A centred entrance door sits between two windows, one at each end of the cabin, so both halves of
the interior get natural light. The panel construction and steel frame follow the same build as the
rest of the range, insulated for year-round use.

## Where the Portable Cabin fits

- **Site offices** needing more desk space than a single-room cabin allows.
- **Storage** for tools, plant and materials where a wider unit reduces the number of units needed
  on site.
- **Welfare and break rooms**, where the additional length suits a kitchen area alongside seating.

Delivered ready for use — placement on site is the only step before it is in service.`,
    sizes: [
      {
        key: '230x600',
        lengthM: 2.3,
        widthM: 6,
        weightKg: 0,
        isPoa: false,
        price: 4290,
        isDefault: false,
        renderFolder: '',
        views: [],
        sourceUrl: '' // Dimensions supplied by the product owner; no size-specific renders yet.
      },
      {
        key: '300x500',
        lengthM: 3,
        widthM: 5,
        weightKg: 0,
        isPoa: false,
        price: 5090,
        isDefault: false,
        renderFolder: '',
        views: [],
        sourceUrl: '' // Dimensions supplied by the product owner; no size-specific renders yet.
      },
      {
        key: '300x600',
        lengthM: 3,
        widthM: 6,
        weightKg: 0,
        isPoa: false,
        price: 5490,
        isDefault: false,
        renderFolder: '',
        views: [],
        sourceUrl: '' // Dimensions supplied by the product owner; no size-specific renders yet.
      },
      {
        key: '300x700',
        lengthM: 3,
        widthM: 7,
        weightKg: 0,
        isPoa: false,
        price: 5790,
        isDefault: true,
        renderFolder: 'K1002',
        views: ['front', 'left-diagonal', 'right', 'top'],
        sourceUrl: 'https://www.ebay.co.uk/itm/297827911885'
      }
    ]
  }
]

export function manualProductCustomizationConfigurations(product: ManualProduct) {
  return containerCustomizationConfigurations(product.id, product.sizes)
}

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

      if (size.views.length > 0 && !size.views.includes('top')) {
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
  const updateExisting = process.argv.includes('--update-existing')
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
      console.log(updateExisting
        ? `would update copy, prices and append missing sizes for ${product.id}`
        : `would create/replace ${product.id} (${renders.length} render(s))`)
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

    if (updateExisting) {
      // Patch requested copy and confirmed prices; preserve media and all other CMS edits.
      const documents = await client.fetch<Array<{
        _id: string
        _rev: string
        sizes?: Array<{ _key: string; images?: Array<{ alt?: string }> }>
        representativeImages?: Array<{ alt?: string }>
      }>>('*[_id in $ids]{_id, _rev, sizes, representativeImages}', {
        ids: [product.id, `drafts.${product.id}`]
      })
      if (!documents.some((document) => document._id === product.id)) {
        throw new Error(`Published product ${product.id} does not exist`)
      }
      let transaction = client.transaction()
      for (const existing of documents) {
        const additions = product.sizes
          .filter((size) => !existing.sizes?.some((current) => current._key === size.key))
          .map(({ key, renderFolder, views, sourceUrl, ...size }) => ({
            ...size, _key: key, _type: 'sizeOption', label: sizeLabel({ key, renderFolder, views, sourceUrl, ...size }), images: []
          }))
        const altUpdates: Record<string, string> = {}
        const priceUpdates: Record<string, number | boolean> = {}
        for (const size of product.sizes) {
          if (existing.sizes?.some((current) => current._key === size.key)) {
            priceUpdates[`sizes[_key == "${size.key}"].price`] = size.price
            priceUpdates[`sizes[_key == "${size.key}"].isPoa`] = size.isPoa
          }
        }
        const renameImageAlts = (images: Array<{ alt?: string }> | undefined, path: string) => {
          images?.forEach((image, index) => {
            if (image.alt?.includes('K1002')) {
              altUpdates[`${path}[${index}].alt`] = image.alt.replace(/K1002\s*/g, '').trim()
            }
          })
        }
        renameImageAlts(existing.representativeImages, 'representativeImages')
        existing.sizes?.forEach((size, index) => renameImageAlts(size.images, `sizes[${index}].images`))
        transaction = transaction.patch(existing._id, (patch) => {
          const updated = patch.ifRevisionId(existing._rev).set({
            ...altUpdates,
            ...priceUpdates,
            name: product.name,
             shortDescription: product.shortDescription,
             description,
             customizationConfigurations: manualProductCustomizationConfigurations(product),
            'seo.metaTitle': product.seoTitle,
            'seo.metaDescription': product.seoDescription
          })
          return additions.length > 0
            ? updated.setIfMissing({ sizes: [] }).append('sizes', additions)
            : updated
        })
      }
      await transaction.commit()
      console.log(`updated ${product.id} and any existing draft in "${dataset}"`)
      continue
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
       customizationConfigurations: manualProductCustomizationConfigurations(product),
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

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) runScript(main)
