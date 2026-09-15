import { CUSTOMIZATION_GROUP_PROJECTION } from '../../app/queries/catalog'
import type { SanityProduct } from '../../app/types/catalog'

export interface SanityQueryConfig {
  projectId: string
  dataset: string
  apiVersion?: string
}

/**
 * Only the fields Quote Enquiry revalidation reads: Size Options and customization resolution
 * inputs. Deliberately narrower than `PRODUCTS_WITH_SIZES_QUERY` — no images, categories, or
 * SEO — since this projection runs on every quote submission, not once per page load.
 */
const PRODUCT_VALIDATION_PROJECTION = `{
  _id, name, status,
  sizes[]{ _key, label, price, isPoa },
  customizationConfigurations[]{
    _key,
    "group": group->${CUSTOMIZATION_GROUP_PROJECTION},
    itemOverrides[]{
      _key, itemKey, enabled, pricingType, price, titleOverride, descriptionOverride,
      sizeRules[]{
        _key, sizeOptionKey, mode, price, titleOverride, descriptionOverride,
        review { status, snapshot }
      }
    }
  }
}`

/**
 * Fetches the current Sanity state of every Product a Quote Enquiry references, keyed by `_id`,
 * so the server can re-resolve pricing/availability instead of trusting the client's numbers.
 * A product no longer present in the result (deleted, or never existed) is simply absent from the
 * map — callers treat that as "unavailable" rather than an error.
 */
export async function fetchProductsForValidation(
  productIds: string[],
  config: SanityQueryConfig,
): Promise<Map<string, SanityProduct>> {
  const uniqueIds = [...new Set(productIds)].filter(Boolean)
  if (uniqueIds.length === 0) return new Map()

  const query = `*[_type == "product" && _id in $ids]${PRODUCT_VALIDATION_PROJECTION}`
  const apiVersion = config.apiVersion ?? 'v2024-01-01'
  const url = new URL(`https://${config.projectId}.api.sanity.io/${apiVersion}/data/query/${config.dataset}`)
  url.searchParams.set('query', query)
  url.searchParams.set('$ids', JSON.stringify(uniqueIds))

  const res = await fetch(url.toString())
  if (!res.ok) {
    throw new Error(`Sanity product validation query failed with status ${res.status}`)
  }

  const json = (await res.json()) as { result: SanityProduct[] }
  return new Map(json.result.map((product) => [product._id, product]))
}
