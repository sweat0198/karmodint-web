/**
 * The Product Line pages (ADR-004) the seed script writes, one entry per Kept URL.
 *
 * Copy lives beside the catalogue copy, in `sanity/product-lines/copy/`: `<slug>.md` is the body,
 * `<slug>.faqs.md` holds one `## question` section per FAQ. Both are the Legacy Site's text word for
 * word; links point at each Legacy link's redirect target (never a redirect source), and cuts are
 * listed per entry.
 *
 * `displayOrder` follows the Kept URL table in docs/plans/2026-10-06-uk-migration-design.md in
 * steps of ten: modular-buildings 10, portable-cabin 20, steel-cabin 30, flat-pack-cabins 40,
 * jackleg-cabin 50, portable-classroom 60, portable-house 70, grp-kiosk-cabin 80, panel-cabin 90,
 * bulletproof-cabin 100.
 */
export interface ProductLineSeed {
  /** Published document id, `productLine-<last path segment>`. */
  id: string
  name: string
  path: string
  /** Another seed's `id`. */
  parentId?: string
  /** A catalogue `category` document id; leave out for a hub page with no product grid. */
  categoryId?: string
  description: string
  cover: { imagePath: string; alt: string }
  copyPath: string
  faqsPath?: string
  displayOrder: number
  seo: { metaTitle: string; metaDescription: string }
}

const COPY_DIR = 'sanity/product-lines/copy'

export const PRODUCT_LINE_SEEDS: ProductLineSeed[] = [
  /*
   * https://www.karmodint.co.uk/grp-kiosk-cabin/ — Cuts: the body photo (a cabin camp, not a GRP
   * kiosk; the cover photo replaces it), the embedded product cards, galleries and related-project
   * widgets (not copy), and the closing list of 48 `/blog/{city}-modular-kiosks/` links, which all
   * redirect to the same Solution. `/outdoor-and-retail-kiosk/` is relinked to its redirect target.
   */
  {
    id: 'productLine-grp-kiosk-cabin',
    name: 'GRP Kiosk Cabin',
    path: '/grp-kiosk-cabin/',
    categoryId: 'category-cabin-grp',
    description:
      'When it comes to providing quality, innovative solutions for a wide range of applications the UK is home to some of the finest GRP kiosks.',
    cover: {
      imagePath: 'public/images/hero/hero-grp-cabin-uk.jpg',
      alt: 'White GRP kiosk cabin with a staffed service window beside a barrier at a UK office entrance'
    },
    copyPath: `${COPY_DIR}/grp-kiosk-cabin.md`,
    faqsPath: `${COPY_DIR}/grp-kiosk-cabin.faqs.md`,
    displayOrder: 80,
    seo: {
      metaTitle: 'GRP Kiosk Cabin for Sale UK from Manufacturer | Karmod Int',
      metaDescription:
        'When it comes to providing quality, innovative solutions for a wide range of applications the UK is home to some of the finest GRP kiosks.'
    }
  }
]
