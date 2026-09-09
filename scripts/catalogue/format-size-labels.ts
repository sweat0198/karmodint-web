/**
 * Reformat stored product Size Label fields from their existing metric dimensions.
 *
 *   npm run catalogue:format-size-labels -- --dry-run
 *   npm run catalogue:format-size-labels
 */
import { formatFootprintLabel } from '../../shared/utils/sizeLabels'
import { runScript } from './lib/runScript'
import { createSanityClient, readSanityTarget } from './lib/sanityEnv'

interface ProductSize {
  _key?: string
  label?: string
  lengthM?: number
  widthM?: number
}

interface ProductWithSizes {
  _id: string
  sizes?: ProductSize[]
}

interface LabelChange {
  productId: string
  sizeKey: string
  from: string | undefined
  to: string
}

const PRODUCT_SIZES_QUERY = `*[_type == 'product']{_id, sizes[]{_key, label, lengthM, widthM}}`

function labelsToUpdate(product: ProductWithSizes): LabelChange[] {
  return (product.sizes ?? []).flatMap((size) => {
    if (!size._key || typeof size.lengthM !== 'number' || typeof size.widthM !== 'number') {
      throw new Error(`Product ${product._id} has a size without _key, lengthM, or widthM`)
    }

    const label = formatFootprintLabel(size.lengthM, size.widthM)
    return label === size.label
      ? []
      : [{ productId: product._id, sizeKey: size._key, from: size.label, to: label }]
  })
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run')
  const target = readSanityTarget()
  const client = createSanityClient(target)
  const products = await client.fetch<ProductWithSizes[]>(PRODUCT_SIZES_QUERY)
  const changes = products.flatMap(labelsToUpdate)

  console.log(`${changes.length} size label(s) need update in "${target.dataset}"`)
  for (const change of changes.slice(0, 10)) {
    console.log(`${change.productId}/${change.sizeKey}: ${change.from ?? '(empty)'} -> ${change.to}`)
  }
  if (changes.length > 10) console.log(`... ${changes.length - 10} more`)

  if (dryRun || changes.length === 0) {
    console.log(dryRun ? 'dry run — nothing written to Sanity' : 'no write needed')
    return
  }

  const changesByProduct = new Map<string, LabelChange[]>()
  for (const change of changes) {
    const productChanges = changesByProduct.get(change.productId) ?? []
    productChanges.push(change)
    changesByProduct.set(change.productId, productChanges)
  }
  let transaction = client.transaction()
  for (const [productId, productChanges] of changesByProduct) {
    const set = Object.fromEntries(
      productChanges.map((change) => [
        `sizes[_key == ${JSON.stringify(change.sizeKey)}].label`,
        change.to
      ])
    )
    transaction = transaction.patch(productId, { set })
  }
  await transaction.commit()

  console.log(`updated ${changes.length} size label(s) across ${changesByProduct.size} product(s) in "${target.dataset}"`)
}

runScript(main)
