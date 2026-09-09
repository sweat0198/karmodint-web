/**
 * Reformat stored product Size Label fields from their existing metric dimensions.
 *
 *   npm run catalogue:format-size-labels -- --dry-run
 *   npm run catalogue:format-size-labels
 */
import { runScript } from './lib/runScript'
import { createSanityClient, readSanityTarget } from './lib/sanityEnv'
import {
  labelPatchSet,
  labelsToUpdate,
  type LabelChange,
  type ProductWithSizes
} from './lib/sizeLabelMigration'

const PRODUCT_SIZES_QUERY = `*[_type == 'product']{_id, sizes[]{_key, label, lengthM, widthM}}`

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
    transaction = transaction.patch(productId, { set: labelPatchSet(productChanges) })
  }
  await transaction.commit()

  console.log(`updated ${changes.length} size label(s) across ${changesByProduct.size} product(s) in "${target.dataset}"`)
}

runScript(main)
