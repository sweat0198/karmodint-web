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
   * https://www.karmodint.co.uk/modular-buildings/ — Cuts: body photos, two video thumbnails linking
   * to YouTube and two galleries (not copy). The `/modular-buildings/modular-school-buildings/` link
   * is relinked to its redirect target. Cut at the client's sign-off (issue #31): the sentence
   * ending "economic efficienc", truncated in the Legacy copy itself, and the FAQ "Who builds the best
   * portable buildings?", which names competitors (kept in docs/plans/2026-10-07-kept-url-copy-sign-off.md).
   */
  {
    id: 'productLine-modular-buildings',
    name: 'Modular Buildings',
    path: '/modular-buildings/',
    description:
      'These structures, deeply rooted in the modular building architectural style, promise not just sustainability but also significant cost advantages.',
    cover: {
      imagePath: 'public/images/hero/hero-modular-containers.jpg',
      alt: 'Grey single-storey modular office building with a glazed entrance beside parking bays on a business park'
    },
    copyPath: `${COPY_DIR}/modular-buildings.md`,
    faqsPath: `${COPY_DIR}/modular-buildings.faqs.md`,
    displayOrder: 10,
    seo: {
      metaTitle: 'Modular Building for Sale UK from Manufacturer Company',
      metaDescription:
        'These structures, deeply rooted in the modular building architectural style, promise not just sustainability but also significant cost advantages.'
    }
  },
  /*
   * https://www.karmodint.co.uk/portable-cabin/ — Cuts: photos, two video thumbnails, galleries and
   * the related-projects widget (not copy); the list of 52
   * `/blog/{city}-portable-cabin-and-container/` links, which all redirect back to this page; the
   * FAQ "What is the cost of a cabin?" (a USD range, "$10,000 to $5,000", no longer true). The
   * `/container/` link, which redirects here, is unlinked; the other Legacy links point at their
   * redirect targets.
   */
  {
    id: 'productLine-portable-cabin',
    name: 'Portable Cabin',
    path: '/portable-cabin/',
    categoryId: 'category-containers',
    description:
      'Affordable portable cabin for sale, perfect for big and small project. Discover customizable solutions with top-quality designs at competitive prices.',
    cover: {
      imagePath: 'public/images/hero/hero-container-3x7-uk.webp',
      alt: 'White portable cabin with a tan steel frame, a door and two windows on concrete pads beside a construction site'
    },
    copyPath: `${COPY_DIR}/portable-cabin.md`,
    faqsPath: `${COPY_DIR}/portable-cabin.faqs.md`,
    displayOrder: 20,
    seo: {
      metaTitle: 'Portable Cabin for Sale | Affordable Prices and Big Projects',
      metaDescription:
        'Affordable portable cabin for sale, perfect for big and small project. Discover customizable solutions with top-quality designs at competitive prices.'
    }
  },
  /*
   * https://www.karmodint.co.uk/portable-cabin/steel-cabin/ — Cuts: photos, video thumbnails,
   * galleries and the embedded K1002/K2004/K2005 product cards (not copy). An empty link around one
   * sentence (a scrape artefact) is dropped; `/container/` is relinked to its redirect target.
   */
  {
    id: 'productLine-steel-cabin',
    name: 'Steel Cabin',
    path: '/portable-cabin/steel-cabin/',
    parentId: 'productLine-portable-cabin',
    categoryId: 'category-containers',
    description:
      'Discover the best steel cabins for sale in the UK. Explore steel cabin prices and sizes for your perfect space solution.',
    cover: {
      imagePath: 'public/images/hero/hero-container-2-3x6-uk.webp',
      alt: 'Steel-framed portable cabin with white panels, a central door and two windows on concrete blocks at a housing development'
    },
    copyPath: `${COPY_DIR}/steel-cabin.md`,
    displayOrder: 30,
    seo: {
      metaTitle: 'Best Steel Cabin Prices for Sale UK from Manufacturer',
      metaDescription:
        'Discover the best steel cabins for sale in the UK. Explore steel cabin prices and sizes for your perfect space solution.'
    }
  },
  /*
   * https://www.karmodint.co.uk/portable-cabin/flat-pack-cabins/ — Cuts: photos, video thumbnails,
   * galleries and the embedded K1002/K2004/K2005 product cards (not copy). `/container/` is relinked
   * to its redirect target.
   */
  {
    id: 'productLine-flat-pack-cabins',
    name: 'Flat Pack Cabin',
    path: '/portable-cabin/flat-pack-cabins/',
    parentId: 'productLine-portable-cabin',
    categoryId: 'category-containers',
    description:
      'Find the best flat pack cabin for sale in the UK. Explore prices and sizes for your ideal space solution.',
    cover: {
      imagePath: 'public/images/products/K3005/left-diagonal.png',
      alt: 'Flat pack cabin with white insulated panels, a tan steel frame, a central door and two windows'
    },
    copyPath: `${COPY_DIR}/flat-pack-cabins.md`,
    faqsPath: `${COPY_DIR}/flat-pack-cabins.faqs.md`,
    displayOrder: 40,
    seo: {
      metaTitle: 'Best Flat Pack Cabin for Sale UK | Prices and Sizes',
      metaDescription:
        'Find the best flat pack cabin for sale in the UK. Explore prices and sizes for your ideal space solution.'
    }
  },
  /*
   * https://www.karmodint.co.uk/portable-cabin/jackleg-cabin/ — Cuts: photos, video thumbnails,
   * galleries and the embedded K1002/K2004/K2005 product cards (not copy). `/container/` is relinked
   * to its redirect target.
   */
  {
    id: 'productLine-jackleg-cabin',
    name: 'Jackleg Cabin',
    path: '/portable-cabin/jackleg-cabin/',
    parentId: 'productLine-portable-cabin',
    categoryId: 'category-containers',
    description:
      'Explore competitive jackleg cabin prices for sale and elevate your workspace with versatile solutions. Find the perfect cabin for your needs today.',
    cover: {
      imagePath: 'public/images/solutions/site-offices.png',
      alt: 'Portable site office cabin on concrete pads beside a UK construction site with a tower crane'
    },
    copyPath: `${COPY_DIR}/jackleg-cabin.md`,
    faqsPath: `${COPY_DIR}/jackleg-cabin.faqs.md`,
    displayOrder: 50,
    seo: {
      metaTitle: 'Best Jackleg Cabin Prices for Sale UK from Manufacturer',
      metaDescription:
        'Explore competitive jackleg cabin prices for sale and elevate your workspace with versatile solutions. Find the perfect cabin for your needs today.'
    }
  },
  /*
   * https://www.karmodint.co.uk/portable-cabin/portable-classroom/ — Cuts: photos, video thumbnails,
   * galleries and the related-projects widget (not copy); the FAQ "How much does it cost for a
   * portable classroom?" (a USD range, "$20,000 to $100,000", no longer true). `/container/` is
   * relinked to its redirect target. Cut at the client's sign-off (issue #31), since Karmod sells new
   * units only: every sentence about hiring, renting or buying used classrooms, the section "Buyer's
   * Beware: Navigating Disadvantages of Used Portable Classrooms" and the FAQ "Which is more
   * advantageous for a mobile classroom, buying or renting?".
   */
  {
    id: 'productLine-portable-classroom',
    name: 'Portable Classroom',
    path: '/portable-cabin/portable-classroom/',
    parentId: 'productLine-portable-cabin',
    categoryId: 'category-containers',
    description:
      'Discover our Portable Classroom: flexible, cost-effective, and ideal for expanding educational spaces.',
    cover: {
      imagePath: 'public/images/products/K8001/left-diagonal.png',
      alt: 'Portable cabin with white insulated panels, a tan steel frame, a door and two windows'
    },
    copyPath: `${COPY_DIR}/portable-classroom.md`,
    faqsPath: `${COPY_DIR}/portable-classroom.faqs.md`,
    displayOrder: 60,
    seo: {
      metaTitle: 'Portable Classroom for Sale | Mobile Nursery Building Cost',
      metaDescription:
        'Discover our Portable Classroom: flexible, cost-effective, and ideal for expanding educational spaces.'
    }
  },
  /*
   * https://www.karmodint.co.uk/portable-cabin/portable-house/ — Cuts: photos, video thumbnails and
   * galleries (not copy), and one empty list item. `/container/` is relinked to its redirect target.
   * Cut at the client's sign-off (issue #31): the four FAQs quoting general UK house prices in £.
   */
  {
    id: 'productLine-portable-house',
    name: 'Portable House',
    path: '/portable-cabin/portable-house/',
    parentId: 'productLine-portable-cabin',
    categoryId: 'category-containers',
    description:
      'Portable house cabin for sale: Explore affordable prices and diverse projects. Your dream portable home awaits! Get price now...',
    cover: {
      imagePath: 'public/images/solutions/accommodation-units.png',
      alt: 'Row of portable accommodation cabins on a gravel site with wind turbines on the hills behind'
    },
    copyPath: `${COPY_DIR}/portable-house.md`,
    faqsPath: `${COPY_DIR}/portable-house.faqs.md`,
    displayOrder: 70,
    seo: {
      metaTitle: 'Portable House Cabin for Sale | Projects and Prices',
      metaDescription:
        'Portable house cabin for sale: Explore affordable prices and diverse projects. Your dream portable home awaits! Get price now...'
    }
  },
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
  },
  /*
   * https://www.karmodint.co.uk/panel-cabin/ — Cuts: the gallery (not copy) and the sentence "With
   * options ranging from 2m² to 10m², our cabins are available in a range of sizes, ensuring
   * versatility for any requirement." (no cabin in the range reaches 10m²). `/guard-booths/` and
   * `/outdoor-and-retail-kiosk/` are relinked to their redirect targets.
   */
  {
    id: 'productLine-panel-cabin',
    name: 'Panel Cabin',
    path: '/panel-cabin/',
    categoryId: 'category-cabin-panel',
    description:
      'Versatile panel cabins for security or retail use, offering superior insulation, quick setup, and durability. Available in multiple sizes.',
    cover: {
      imagePath: 'public/images/hero/hero-panel-cabin-uk.jpg',
      alt: 'Insulated panel security cabin with a staffed window beside the barrier at a logistics park depot entrance'
    },
    copyPath: `${COPY_DIR}/panel-cabin.md`,
    displayOrder: 90,
    seo: {
      metaTitle: 'Panel Cabin for Sale | Security or Retail',
      metaDescription:
        'Versatile panel cabins for security or retail use, offering superior insulation, quick setup, and durability. Available in multiple sizes.'
    }
  },
  /*
   * https://www.karmodint.co.uk/bulletproof-cabin/ — Cuts: the photo, the gallery and its heading
   * "Bulletproof Cabin Pictures" (nothing left under it). Hard line breaks become paragraph breaks.
   * `/outdoor-and-retail-kiosk/` is relinked to its redirect target.
   */
  {
    id: 'productLine-bulletproof-cabin',
    name: 'Bulletproof Cabin',
    path: '/bulletproof-cabin/',
    categoryId: 'category-bulletproof',
    description:
      'Discover bulletproof cabin prices and top-notch armoured security cabins for sale. Prioritize safety with our reliable solutions.',
    cover: {
      imagePath: 'public/images/hero/hero-bulletproof-cabin-uk.jpg',
      alt: 'Armoured security checkpoint cabin with floodlights and a barrier arm at dusk'
    },
    copyPath: `${COPY_DIR}/bulletproof-cabin.md`,
    displayOrder: 100,
    seo: {
      metaTitle: 'Bulletproof Cabin Prices for Sale | Armoured Security Cabin',
      metaDescription:
        'Discover bulletproof cabin prices and top-notch armoured security cabins for sale. Prioritize safety with our reliable solutions.'
    }
  }
]
