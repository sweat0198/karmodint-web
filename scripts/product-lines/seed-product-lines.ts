/**
 * Upload each Product Line's cover and createOrReplace its `productLine` document (ADR-004).
 *
 *   pnpm product-lines:seed --dry-run           # offline: validate and summarise, no token needed
 *   pnpm product-lines:seed --dry-run --print   # also print every document as JSON
 *   pnpm product-lines:seed                     # write to $SANITY_DATASET
 *   SANITY_DATASET=production pnpm product-lines:seed
 *
 * createOrReplace discards Studio edits made since the last run, so re-run only to (re)apply
 * seeded copy. Covers are safe to re-upload: Sanity keys an image asset by its content hash.
 */
import fs from 'node:fs'
import path from 'node:path'
import { PRODUCT_LINE_SEEDS } from './data'
import { buildProductLineDocuments, type ProductLineDocument } from './buildDocuments'
import { loadRedirectSources } from '../catalogue/lib/redirectSources'
import { repoPath } from '../catalogue/lib/paths'
import { createSanityClient, readDataset, readSanityTarget } from '../catalogue/lib/sanityEnv'
import { runScript } from '../catalogue/lib/runScript'

function summarise(document: ProductLineDocument): string {
  const parts = [
    document.path,
    document.parent ? `parent ${document.parent._ref}` : 'top level',
    document.category ? `category ${document.category._ref}` : 'hub (no grid)',
    `${document.body.length} body blocks`,
    `${document.faqs?.length ?? 0} FAQs`,
    `title "${document.seo.metaTitle}"`
  ]
  return `${document._id}: ${parts.join(', ')}`
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run')
  const print = process.argv.includes('--print')

  const missingCovers = PRODUCT_LINE_SEEDS.filter((seed) => !fs.existsSync(repoPath(seed.cover.imagePath)))
  if (missingCovers.length > 0) {
    throw new Error(`Missing cover images:\n  ${missingCovers.map((seed) => seed.cover.imagePath).join('\n  ')}`)
  }

  const options = {
    readFile: (file: string) => fs.readFileSync(repoPath(file), 'utf-8'),
    redirectSources: loadRedirectSources()
  }

  if (dryRun) {
    // Nothing is uploaded, so each cover's own path stands in for its asset id.
    const placeholders = Object.fromEntries(PRODUCT_LINE_SEEDS.map((seed) => [seed.cover.imagePath, seed.cover.imagePath]))
    const documents = buildProductLineDocuments(PRODUCT_LINE_SEEDS, { ...options, assetIds: placeholders })
    console.log(`product-lines:seed target: dataset "${readDataset()}" (dry run — no network write)`)
    for (const document of documents) console.log(`would write ${summarise(document)}`)
    if (print) console.log(JSON.stringify(documents, null, 2))
    return
  }

  const target = readSanityTarget()
  const client = createSanityClient(target)

  // Check references before writing, so a seed never lands pointing at a missing category.
  const categoryIds = [...new Set(PRODUCT_LINE_SEEDS.flatMap((seed) => (seed.categoryId ? [seed.categoryId] : [])))]
  const existing = new Set(await client.fetch<string[]>('*[_id in $ids]._id', { ids: categoryIds }))
  const missing = categoryIds.filter((id) => !existing.has(id))
  if (missing.length > 0) throw new Error(`Categories missing from "${target.dataset}": ${missing.join(', ')}`)

  const assetIds: Record<string, string> = {}
  for (const seed of PRODUCT_LINE_SEEDS) {
    const asset = await client.assets.upload('image', fs.createReadStream(repoPath(seed.cover.imagePath)), {
      filename: path.basename(seed.cover.imagePath)
    })
    assetIds[seed.cover.imagePath] = asset._id
    console.log(`uploaded  ${seed.cover.imagePath} -> ${asset._id}`)
  }

  const documents = buildProductLineDocuments(PRODUCT_LINE_SEEDS, { ...options, assetIds })
  let transaction = client.transaction()
  for (const document of documents) transaction = transaction.createOrReplace(document)
  await transaction.commit()

  for (const document of documents) console.log(`wrote     ${summarise(document)}`)
  console.log(`${documents.length} Product Line documents written to "${target.dataset}"`)
}

runScript(main)
