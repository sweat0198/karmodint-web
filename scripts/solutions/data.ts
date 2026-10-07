export interface SolutionCover {
  slug: string
  imagePath: string
  alt: string
}

const COVERS_DIR = 'public/images/solutions'

/**
 * The chosen cover for each Solution, one image per slug in `public/images/solutions/`.
 *
 * Alt text describes what each image actually shows, not the prompt it was generated from.
 */
export const SOLUTION_COVERS: SolutionCover[] = [
  { slug: 'site-offices', imagePath: `${COVERS_DIR}/site-offices.png`, alt: 'Portable site office cabin on concrete pads beside a UK construction site with a tower crane' },
  { slug: 'security-gatehouses-and-access-control', imagePath: `${COVERS_DIR}/security-gatehouses-and-access-control.png`, alt: 'Grey security gatehouse cabin with a barrier arm at the vehicle entrance of a business park' },
  { slug: 'ticket-information-and-service-kiosks', imagePath: `${COVERS_DIR}/ticket-information-and-service-kiosks.png`, alt: 'White GRP ticket kiosk with a staffed service window and queue rails on a stadium concourse' },
  { slug: 'canteens-and-break-rooms', imagePath: `${COVERS_DIR}/canteens-and-break-rooms.png`, alt: 'Portable cabin break room with picnic benches outside in a construction compound' },
  { slug: 'welfare-and-wc-units', imagePath: `${COVERS_DIR}/welfare-and-wc-units.png`, alt: 'Portable welfare cabin with frosted windows, access ramp and steps on a construction site' },
  { slug: 'high-security-cabins', imagePath: `${COVERS_DIR}/high-security-cabins.png`, alt: 'Bullet-resistant security cabin with protective bollards at an industrial site checkpoint' },
  { slug: 'visitor-reception-and-sign-in', imagePath: `${COVERS_DIR}/visitor-reception-and-sign-in.png`, alt: 'Composite reception cabin with a glazed desk window at a business campus car park entrance' },
  { slug: 'car-park-valet-and-weighbridge-cabins', imagePath: `${COVERS_DIR}/car-park-valet-and-weighbridge-cabins.png`, alt: 'Car park attendant cabin between barrier arms on a kerbed island in a business park car park' },
  { slug: 'retail-and-food-service-kiosks', imagePath: `${COVERS_DIR}/retail-and-food-service-kiosks.png`, alt: 'Coffee kiosk with an open serving hatch and planters on a paved public square' },
  { slug: 'garden-rooms-and-garden-offices', imagePath: `${COVERS_DIR}/garden-rooms-and-garden-offices.png`, alt: 'Garden office cabin on a patio at the end of a landscaped back garden' },
  { slug: 'healthcare-and-consultation-rooms', imagePath: `${COVERS_DIR}/healthcare-and-consultation-rooms.png`, alt: 'Portable consultation room with an accessible ramp beside a healthcare building' },
  { slug: 'accommodation-units', imagePath: `${COVERS_DIR}/accommodation-units.png`, alt: 'Row of portable accommodation cabins on a gravel site with wind turbines on the hills behind' }
]

/** One Solution's ported Legacy copy (issue #26): the Legacy URL it replaced and the copy files. */
export interface SolutionCopy {
  slug: string
  /** The Legacy URL whose copy this is; it now 301s to the Solution. */
  legacyPath: string
  /** Body markdown, repo-relative. */
  copyPath: string
  /** One `## question` section per FAQ; left out when the Legacy copy had none. */
  faqsPath?: string
}

const COPY_DIR = 'sanity/solutions/copy'

/**
 * The eight Solutions a Legacy URL now redirects to carry its body copy and FAQs word for word
 * (docs/plans/2026-10-06-uk-migration-design.md, "Solution changes"). The other four keep their
 * current content and are never patched.
 *
 * Cuts follow the spec's rule (only claims about products, sizes or contact details that are no
 * longer true) and are listed per entry below. Everywhere: Legacy-hosted images and videos,
 * embedded product cards, galleries and related-project widgets (not copy). Links point at each
 * Legacy link's redirect target; a link whose target is the Solution itself is dropped, its text
 * kept.
 */
export const SOLUTION_COPY: SolutionCopy[] = [
  /*
   * https://www.karmodint.co.uk/outdoor-and-retail-kiosk/ — Cuts: every claim that Karmod rents
   * kiosks or sells used ones, which contradicts "we do not offer second-hand products or rentals"
   * (/site-cabin/) and "does not offer second-hand products" (toilet page): the second sentence of
   * "Extensive Options for Every Business"; "Every kiosk, from retail kiosk rental to purchase, …"
   * (Creativity); "Whether it's a retail kiosk for sale or rental retail kiosk options, …"
   * (Variety and Customization); "Each used retail kiosk for sale, … unfolding …"; the "Factors
   * Influencing Cost" bullet (retail kiosk rental agreement) and the "Economical Alternatives" bullet
   * (used retail kiosks for sale); the renting half of "Rent or Own?" (its paragraph and the
   * "Financial Flexibility" / "Location Versatility" bullets, which pitch rentals "from … Karmod");
   * the "Quality Assurance" bullet ("even a used retail kiosk … thoroughly inspected").
   * Self-links unlinked: /catering-kiosk-for-food-and-coffee/, /outdoor-and-retail-kiosk/.
   */
  {
    slug: 'retail-and-food-service-kiosks',
    legacyPath: '/outdoor-and-retail-kiosk/',
    copyPath: `${COPY_DIR}/retail-and-food-service-kiosks.md`,
    faqsPath: `${COPY_DIR}/retail-and-food-service-kiosks.faqs.md`
  },
  /* https://www.karmodint.co.uk/farm-workers-accommodation/ — No copy cuts. */
  {
    slug: 'accommodation-units',
    legacyPath: '/farm-workers-accommodation/',
    copyPath: `${COPY_DIR}/accommodation-units.md`
  },
  /*
   * https://www.karmodint.co.uk/security-gatehouse-security-guardhouse/ — No copy cuts.
   * Self-links unlinked: /guard-booths/, /security-hut/.
   */
  {
    slug: 'security-gatehouses-and-access-control',
    legacyPath: '/security-gatehouse-security-guardhouse/',
    copyPath: `${COPY_DIR}/security-gatehouses-and-access-control.md`
  },
  /* https://www.karmodint.co.uk/site-cabin/ — No copy cuts. */
  {
    slug: 'site-offices',
    legacyPath: '/site-cabin/',
    copyPath: `${COPY_DIR}/site-offices.md`,
    faqsPath: `${COPY_DIR}/site-offices.faqs.md`
  },
  /*
   * https://www.karmodint.co.uk/portable-cabin/portable-toilet-and-shower-cabin/ — No copy cuts.
   * Self-link unlinked: /chemical-toilet/.
   */
  {
    slug: 'welfare-and-wc-units',
    legacyPath: '/portable-cabin/portable-toilet-and-shower-cabin/',
    copyPath: `${COPY_DIR}/welfare-and-wc-units.md`,
    faqsPath: `${COPY_DIR}/welfare-and-wc-units.faqs.md`
  },
  /* https://www.karmodint.co.uk/car-park-kiosk-and-parking-booths/ — No copy cuts. */
  {
    slug: 'car-park-valet-and-weighbridge-cabins',
    legacyPath: '/car-park-kiosk-and-parking-booths/',
    copyPath: `${COPY_DIR}/car-park-valet-and-weighbridge-cabins.md`
  },
  /* https://www.karmodint.co.uk/ticket-booths/ — No copy cuts. */
  {
    slug: 'ticket-information-and-service-kiosks',
    legacyPath: '/ticket-booths/',
    copyPath: `${COPY_DIR}/ticket-information-and-service-kiosks.md`
  },
  /* https://www.karmodint.co.uk/garden-office/ — No copy cuts. */
  {
    slug: 'garden-rooms-and-garden-offices',
    legacyPath: '/garden-office/',
    copyPath: `${COPY_DIR}/garden-rooms-and-garden-offices.md`
  }
]
