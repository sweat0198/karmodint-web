/**
 * Verify the deterministic homepage reference documents in the raw Sanity dataset.
 *
 *   pnpm references:verify
 */
import { REFERENCE_SEEDS } from './data'
import { createSanityClient, readSanityTarget } from '../catalogue/lib/sanityEnv'
import { runScript } from '../catalogue/lib/runScript'

interface RemoteReference {
  _id: string
  companyName: string
  logo?: { asset?: { _ref?: string } }
}

async function main(): Promise<void> {
  const target = readSanityTarget()
  const documents = await createSanityClient(target).fetch<RemoteReference[]>(
    `*[_type == "clientReference"] { _id, companyName, logo { asset } }`,
    {},
    { perspective: 'raw' }
  )

  const publishedIds = new Set(REFERENCE_SEEDS.filter((seed) => seed.published).map((seed) => seed.id))
  const draftIds = new Set(REFERENCE_SEEDS.filter((seed) => !seed.published).map((seed) => `drafts.${seed.id}`))
  const expectedIds = new Set([...publishedIds, ...draftIds])
  const actualIds = new Set(documents.map((document) => document._id))
  const missingIds = [...expectedIds].filter((id) => !actualIds.has(id))
  const unexpectedDrafts = documents
    .filter((document) => document._id.startsWith('drafts.') && !draftIds.has(document._id))
    .map((document) => document._id)
  const missingLogos = documents.filter((document) => !document.logo?.asset?._ref)

  const actualPublishedCount = documents.filter((document) => publishedIds.has(document._id)).length
  const actualDraftCount = documents.filter((document) => draftIds.has(document._id)).length
  const problems = [
    missingIds.length ? `missing IDs: ${missingIds.join(', ')}` : null,
    unexpectedDrafts.length ? `unexpected drafts: ${unexpectedDrafts.join(', ')}` : null,
    documents.length !== REFERENCE_SEEDS.length ? `expected 8 documents, found ${documents.length}` : null,
    actualPublishedCount !== publishedIds.size ? `expected ${publishedIds.size} published, found ${actualPublishedCount}` : null,
    actualDraftCount !== draftIds.size ? `expected ${draftIds.size} drafts, found ${actualDraftCount}` : null,
    missingLogos.length ? `missing logo refs: ${missingLogos.map((document) => document._id).join(', ')}` : null
  ].filter((problem): problem is string => problem !== null)

  if (problems.length > 0) {
    throw new Error(`Reference verification failed:\n  ${problems.join('\n  ')}`)
  }

  console.log(`References verified in "${target.dataset}": 8 total, 6 published, 2 drafts, 8 logo refs`)
}

runScript(main)
