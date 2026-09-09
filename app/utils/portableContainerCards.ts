import type { SanityImage } from '~/types/catalog'
import type { CatalogProduct, CatalogSizeOption } from '~/queries/catalog'
import { formatFootprintLabel, formatImperialDimension } from '~~/shared/utils/sizeLabels'
import { getWeightLabel } from '~~/shared/utils/priceLabel'

export interface PortableContainerSize {
  sizeKey: string
  sourceLabel: string
  sizeLabel: string
  specs: string[]
  lengthM: number
  widthM: number
  heightM?: number
  price?: number
  isPoa: boolean
  planImage: CatalogSizeOption['planImage']
  images: CatalogSizeOption['images']
}

/** A portable model is one catalogue card; its configured sizes are chosen later in Customize. */
export interface PortableContainerCard {
  cardId: string
  productId: string
  productName: string
  productSlug: string
  shortDescription: string
  categorySlugs: string[]
  categoryNames: string[]
  sizes: PortableContainerSize[]
  representativeImage?: SanityImage
  /** Lowest configured numeric base price. Undefined means price on application. */
  lowestPrice?: number
  isPoaOnly: boolean
}

export function isPortableContainerProduct(product: CatalogProduct): boolean {
  return product.categories.some(
    (category) => category.slug === 'containers' || category.parent?.slug === 'containers'
  )
}

function footprint(size: CatalogSizeOption): number {
  return size.lengthM * size.widthM
}

function categoryMetadata(product: CatalogProduct): { slugs: string[]; names: string[] } {
  const slugs = new Set<string>()
  const names = new Set<string>()
  for (const category of product.categories) {
    slugs.add(category.slug)
    names.add(category.name)
    if (category.parent) {
      slugs.add(category.parent.slug)
      names.add(category.parent.name)
    }
  }
  return { slugs: [...slugs], names: [...names] }
}

function toPortableSize(size: CatalogSizeOption): PortableContainerSize {
  const specs = [
    size.heightM ? `Height: ${formatImperialDimension(size.heightM)}` : undefined,
    getWeightLabel(size.weightKg)
  ].filter((value): value is string => Boolean(value))

  return {
    sizeKey: size._key ?? '',
    sourceLabel: size.label,
    sizeLabel: formatFootprintLabel(size.lengthM, size.widthM),
    specs,
    lengthM: size.lengthM,
    widthM: size.widthM,
    heightM: size.heightM,
    price: size.price,
    isPoa: size.isPoa === true,
    planImage: size.planImage,
    images: size.images
  }
}

function representativeImage(product: CatalogProduct): SanityImage | undefined {
  return product.representativeImages?.[0]
    ?? product.sizes.find((size) => size.thumbnail ?? size.fallbackThumbnail)?.thumbnail
    ?? product.sizes.find((size) => size.fallbackThumbnail)?.fallbackThumbnail
}

/**
 * Create one card per portable-container model. Unlike `toSizeCards`, no configured size is
 * discarded for missing media: containers can legally share a product-level representative image.
 */
export function toPortableContainerCards(products: CatalogProduct[]): PortableContainerCard[] {
  return products
    .filter(isPortableContainerProduct)
    .map((product) => {
      const sizes = [...product.sizes]
        .sort((a, b) => footprint(a) - footprint(b))
        .map(toPortableSize)
      const numericPrices = sizes
        .filter((size) => !size.isPoa && typeof size.price === 'number')
        .map((size) => size.price as number)
      const metadata = categoryMetadata(product)

      return {
        cardId: `portable-${product._id}`,
        productId: product._id,
        productName: product.name,
        productSlug: product.slug,
        shortDescription: product.shortDescription ?? '',
        categorySlugs: metadata.slugs,
        categoryNames: metadata.names,
        sizes,
        representativeImage: representativeImage(product),
        lowestPrice: numericPrices.length ? Math.min(...numericPrices) : undefined,
        isPoaOnly: numericPrices.length === 0
      }
    })
}
