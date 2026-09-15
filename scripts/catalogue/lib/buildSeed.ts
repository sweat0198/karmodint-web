import type { ProductImageView } from '../../../sanity/schemas/objects/productImageViews'
import {
  cabinCustomizationConfigurations,
  type SeedCustomizationConfiguration
} from '../../customizations/lib/seedRecipes'
import { renderAltText } from './altText'
import type { AssetManifest } from './assets'
import type { ProductCopy } from './copy'
import { renderPath, sizeLabel, type CatalogueManifest, type ManifestProduct } from './manifest'
import { markdownToPortableText, validatePortableText, type PortableTextBlock } from './portableText'

/** Where the generated seed lands — written by the import, checked for currency by the verification. */
export const SEED_FILE = 'sanity/seeds/products.ndjson'

export interface SeedImage {
  _key: ProductImageView
  _type: 'image'
  view: ProductImageView
  alt: string
  asset: { _type: 'reference', _ref: string }
}

export interface SeedSize {
  _key: string
  _type: 'sizeOption'
  label: string
  lengthM: number
  widthM: number
  heightM?: number
  weightKg: number
  isPoa: boolean
  price: number
  isDefault: boolean
  images: SeedImage[]
}

export type { SeedCustomizationConfiguration } from '../../customizations/lib/seedRecipes'

export interface SeedProduct {
  _id: string
  _type: 'product'
  name: string
  slug: { _type: 'slug', current: string }
  shortDescription: string
  description: PortableTextBlock[]
  categories: Array<{ _key: string, _type: 'reference', _ref: string }>
  customizationConfigurations: SeedCustomizationConfiguration[]
  sizes: SeedSize[]
  isFeatured: boolean
  status: 'published'
  seo: { _type: 'seo', metaTitle: string, metaDescription: string }
}

/**
 * Build one product document from its manifest row, its copy file and the asset manifest.
 *
 * A pure function of those three inputs, which is what makes the import idempotent: every id and
 * `_key` is derived rather than generated, so a second run replaces documents with byte-identical
 * ones instead of creating new ones.
 *
 * `specifications` is deliberately absent. The source publishes no structured spec data for any
 * family beyond GRP's four dimensions, which already live on the sizes, and an invented spec table
 * would be worse than an empty one.
 */
export function buildProductDocument(
  manifest: CatalogueManifest,
  product: ManifestProduct,
  copy: ProductCopy,
  assets: AssetManifest
): SeedProduct {
  // Both are checked, not just the slug: `name` drives the document title *and* all of the
  // generated alt text, so a copy file that disagrees with the manifest would rename 23 images.
  if (copy.frontmatter.slug !== product.slug) {
    throw new Error(
      `${product.copyFile} declares slug "${copy.frontmatter.slug}" but the manifest says "${product.slug}"`
    )
  }
  if (copy.frontmatter.name !== product.name) {
    throw new Error(
      `${product.copyFile} declares name "${copy.frontmatter.name}" but the manifest says "${product.name}"`
    )
  }

  const description = markdownToPortableText(copy.body, product.slug)
  const problems = validatePortableText(description)
  if (problems.length > 0) {
    throw new Error(`${product.copyFile} converts to Portable Text outside the whitelist:\n  ${problems.join('\n  ')}`)
  }

  return {
    _id: product.id,
    _type: 'product',
    name: copy.frontmatter.name,
    slug: { _type: 'slug', current: product.slug },
    shortDescription: copy.frontmatter.shortDescription,
    description,
    // Regenerated from the manifest on every import, so the parent/subcategory pair cannot drift.
    categories: product.categories.map((categoryId) => ({
      _key: categoryId,
      _type: 'reference' as const,
      _ref: categoryId
    })),
    customizationConfigurations: cabinCustomizationConfigurations(),
    sizes: product.sizes.map((size) => {
      const label = sizeLabel(size)

      return {
        _key: size.key,
        _type: 'sizeOption' as const,
        label,
        lengthM: size.lengthM,
        widthM: size.widthM,
        // Omitted rather than zeroed: heightM is validated positive(), so there is no sentinel for
        // "the source never published one".
        ...(size.heightM === undefined ? {} : { heightM: size.heightM }),
        weightKg: size.weightKg,
        isPoa: size.isPoa,
        price: size.price,
        isDefault: size.isDefault,
        // Gallery order is the manifest's view order, which is the vocabulary's — so the front
        // elevation leads and the size preview picks it up as the thumbnail.
        images: size.views.map((view) => {
          const filePath = renderPath(manifest, size, view)
          const assetId = assets.assets[filePath]
          if (!assetId) {
            throw new Error(
              `No asset id for ${filePath} in the "${assets.dataset}" asset manifest — run the upload first`
            )
          }
          return {
            _key: view,
            _type: 'image' as const,
            view,
            alt: renderAltText(copy.frontmatter.name, label, view),
            asset: { _type: 'reference' as const, _ref: assetId }
          }
        })
      }
    }),
    isFeatured: copy.frontmatter.isFeatured,
    status: 'published',
    seo: {
      _type: 'seo',
      metaTitle: copy.frontmatter.seoTitle,
      metaDescription: copy.frontmatter.seoDescription
    }
  }
}

export function buildCatalogueSeed(
  manifest: CatalogueManifest,
  loadCopy: (copyFile: string) => ProductCopy,
  assets: AssetManifest
): SeedProduct[] {
  return manifest.products.map((product) =>
    buildProductDocument(manifest, product, loadCopy(product.copyFile), assets)
  )
}

export function toNdjson(documents: SeedProduct[]): string {
  return documents.map((document) => JSON.stringify(document)).join('\n') + '\n'
}
