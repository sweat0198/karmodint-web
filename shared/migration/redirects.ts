/**
 * The UK migration's redirect map (design doc "Redirects", glossary "Redirect"): every Legacy URL that isn't a
 * Kept URL moves in one hop to the page that replaces it. Source data: `docs/plans/2026-10-06-uk-migration-redirects.tsv`
 * (`tests/migration/redirectMap.spec.ts` keeps this file and the TSV in step). The build writes the shipped rules into
 * Cloudflare Pages' `_redirects` and fails when a target isn't a built page (`modules/legacy-redirects/`).
 *
 * Rules are grouped by target. A group ships once its target page exists: list it in `REDIRECT_GROUPS`.
 */

export type RedirectStatus = 301 | 302;

export interface RedirectGroup {
  /** The page that replaces the sources, in `/` form (ADR-003). May carry a query string. */
  readonly to: string;
  readonly status: RedirectStatus;
  /** Legacy URLs in `/` form. `_redirects` also gets the slashless twin of each (Cloudflare matches exactly). */
  readonly from: readonly string[];
}

export interface Redirect {
  readonly from: string;
  readonly to: string;
  readonly status: RedirectStatus;
}

const toHome: RedirectGroup = {
  to: "/",
  status: 301,
  from: [
    "/blog/",
  ],
};

const toAbout: RedirectGroup = {
  to: "/about/",
  status: 301,
  from: [
    "/about-us/",
    "/galleries/factory/",
  ],
};

const toContact: RedirectGroup = {
  to: "/contact/",
  status: 301,
  from: [
    "/contact-us/",
  ],
};

/** Interim 302 until the FAQ and Cookies Policy pages exist (#18). */
const toContactInterim: RedirectGroup = {
  to: "/contact/",
  status: 302,
  from: [
    "/cookies-policy/",
    "/faq/",
  ],
};

const toProducts: RedirectGroup = {
  to: "/products/",
  status: 301,
  from: [
    "/catalogs/",
    "/merchant-center/",
  ],
};

const toMetroCityCabins: RedirectGroup = {
  to: "/products/?category=cabin&subcategory=metro-city",
  status: 301,
  from: [
    "/metrocity-cabin/",
  ],
};

const toGallery: RedirectGroup = {
  to: "/gallery/",
  status: 301,
  from: [
    "/galleries/",
    "/galleries/container/",
    "/galleries/dundee-security-hut-for-sale/",
    "/galleries/portable-buildings/",
    "/galleries/prices-for-bulletproof-cabinet-in-chelmsford/",
    "/galleries/security-hut2/",
    "/projects/",
    "/projects/corona-test-portable-cabin/",
    "/projects/covid-19-polyclinic-for-private-hospital/",
    "/projects/enhancing-cricket-club-infrastructure-leicestershire-ccc/",
    "/projects/enhancing-cricket-club-infrastructure/",
    "/projects/farm-workers-accommodation/",
    "/projects/first-gold-mine-construction-site-structures/",
    "/projects/flixbus-ticket-sales-booth/",
    "/projects/german-music-education-centre/",
    "/projects/manchester-united-ticket-booths/",
    "/projects/muriel-hurtis-container-school/",
    "/projects/paris-hotel-cafeteria-grp-kiosk/",
    "/projects/portable-house-with-wooden-cladding/",
    "/projects/romania-boutique-hotel/",
    "/projects/school-from-container-classrooms/",
    "/projects/security-huts-for-american-cemeteries/",
  ],
};

const toRetailKiosks: RedirectGroup = {
  to: "/solutions/retail-and-food-service-kiosks/",
  status: 301,
  from: [
    "/blog/aberdeen-modular-kiosks/",
    "/blog/bath-modular-kiosks/",
    "/blog/belfast-modular-kiosks/",
    "/blog/birmingham-modular-kiosks/",
    "/blog/bradford-modular-kiosks/",
    "/blog/brighton-hove-modular-kiosks/",
    "/blog/bristol-modular-kiosks/",
    "/blog/cambridge-modular-kiosks/",
    "/blog/cardiff-modular-kiosks/",
    "/blog/chichester-modular-kiosks/",
    "/blog/derry-modular-kiosks/",
    "/blog/dundee-modular-kiosks/",
    "/blog/edinburgh-modular-kiosks/",
    "/blog/ely-modular-kiosks/",
    "/blog/exeter-modular-kiosks/",
    "/blog/glasgow-modular-kiosks/",
    "/blog/gloucester-modular-kiosks/",
    "/blog/hereford-modular-kiosks/",
    "/blog/inverness-modular-kiosks/",
    "/blog/kingston-upon-hull-modular-kiosk/",
    "/blog/leicester-modular-kiosks/",
    "/blog/lichfield-modular-kiosks/",
    "/blog/lincoln-modular-kiosks/",
    "/blog/lisburn-modular-kiosks/",
    "/blog/liverpool-modular-kiosks/",
    "/blog/london-modular-kiosks/",
    "/blog/manchester-modular-kiosks/",
    "/blog/newcastle-modular-kiosks/",
    "/blog/newport-modular-kiosks/",
    "/blog/newry-modular-kiosks/",
    "/blog/norwich-modular-kiosks/",
    "/blog/nottingham-modular-kiosks/",
    "/blog/oxford-modular-kiosks/",
    "/blog/perth-modular-kiosks/",
    "/blog/peterborough-modular-kiosks/",
    "/blog/plymouth-modular-kiosk/",
    "/blog/portsmouth-modular-kiosks/",
    "/blog/salford-modular-kiosks/",
    "/blog/sheffield-modular-kiosks/",
    "/blog/st-albans-modular-kiosk/",
    "/blog/st-davids-modular-kiosks/",
    "/blog/truro-modular-kiosks/",
    "/blog/wakefield-modular-kiosks/",
    "/blog/wells-modular-kiosks/",
    "/blog/westminster-modular-kiosks/",
    "/blog/wolverhampton-modular-kiosk/",
    "/blog/worcester-modular-kiosks/",
    "/blog/york-modular-kiosks/",
    "/catering-kiosk-for-food-and-coffee/",
    "/outdoor-and-retail-kiosk/",
  ],
};

const toSecurityGatehouses: RedirectGroup = {
  to: "/solutions/security-gatehouses-and-access-control/",
  status: 301,
  from: [
    "/blog/custom-prefab-booths-for-industrial-facilities/",
    "/blog/importance-of-security-booths-at-schools/",
    "/control-booths/",
    "/guard-booths/",
    "/security-gatehouse-security-guardhouse/",
    "/security-hut/",
  ],
};

const toCarParkCabins: RedirectGroup = {
  to: "/solutions/car-park-valet-and-weighbridge-cabins/",
  status: 301,
  from: [
    "/car-park-kiosk-and-parking-booths/",
  ],
};

const toWelfareUnits: RedirectGroup = {
  to: "/solutions/welfare-and-wc-units/",
  status: 301,
  from: [
    "/chemical-toilet/",
    "/portable-cabin/portable-toilet-and-shower-cabin/",
  ],
};

const toAccommodationUnits: RedirectGroup = {
  to: "/solutions/accommodation-units/",
  status: 301,
  from: [
    "/farm-workers-accommodation/",
  ],
};

const toGardenRooms: RedirectGroup = {
  to: "/solutions/garden-rooms-and-garden-offices/",
  status: 301,
  from: [
    "/garden-office/",
  ],
};

const toTicketKiosks: RedirectGroup = {
  to: "/solutions/ticket-information-and-service-kiosks/",
  status: 301,
  from: [
    "/kiosk-150-150/",
    "/kiosk-150-215/",
    "/kiosk-150-270/",
    "/kiosk-215-215/",
    "/kiosk-215-270/",
    "/kiosk-215-390/",
    "/kiosk-270-270/",
    "/kiosk-270-390/",
    "/kiosk-270-510/",
    "/kiosk-270-630/",
    "/kiosk-270-750/",
    "/kiosk-390-1110/",
    "/kiosk-390-1230/",
    "/kiosk-390-390/",
    "/kiosk-390-510/",
    "/kiosk-390-630/",
    "/kiosk-390-750/",
    "/kiosk-390-870/",
    "/kiosk-390-990/",
    "/modular-kiosk-technical-details/",
    "/ticket-booths-technical-specifications/",
    "/ticket-booths/",
  ],
};

const toSiteOffices: RedirectGroup = {
  to: "/solutions/site-offices/",
  status: 301,
  from: [
    "/portable-cabin/portable-office-cabin/",
    "/site-cabin/",
  ],
};

// Pending: the target page doesn't exist yet. Each group moves to REDIRECT_GROUPS in the ticket that builds its target.

const toPrivacyPolicy: RedirectGroup = {
  to: "/privacy-policy/",
  status: 301,
  from: [
    "/corporate-personal-data-protection-policy/",
    "/kvkk/",
  ],
};

const toGrpKioskCabin: RedirectGroup = {
  to: "/grp-kiosk-cabin/",
  status: 301,
  from: [
    "/150x150-cm-single-security-site-guard-hut-for-sale/",
  ],
};

const toPortableCabin: RedirectGroup = {
  to: "/portable-cabin/",
  status: 301,
  from: [
    "/blog/aberdeen-portable-cabin-and-container/",
    "/blog/bath-portable-cabin-and-container/",
    "/blog/belfast-portable-cabin-and-container/",
    "/blog/birmingham-portable-cabin-and-container/",
    "/blog/bradford-portable-cabin-and-container/",
    "/blog/brighton-and-hove-portable-cabin-and-container/",
    "/blog/cardiff-portable-cabin-and-container/",
    "/blog/carlisle-portable-cabin-and-container/",
    "/blog/chester-portable-cabin-and-container/",
    "/blog/chichester-portable-cabin-and-container/",
    "/blog/derby-portable-cabin-and-container/",
    "/blog/derry-portable-cabin-and-container/",
    "/blog/dundee-portable-cabin-and-container/",
    "/blog/durham-portable-cabin-and-container/",
    "/blog/edinburgh-portable-cabin-and-container/",
    "/blog/exeter-portable-cabin-and-container/",
    "/blog/glasgow-portable-cabin-and-container/",
    "/blog/gloucester-portable-cabin-and-container/",
    "/blog/hereford-portable-cabin-and-container/",
    "/blog/inverness-portable-cabin-and-container/",
    "/blog/kingston-upon-hull-portable-cabin-and-container/",
    "/blog/lancaster-portable-cabin-and-container/",
    "/blog/leeds-portable-cabin-and-container/",
    "/blog/leicester-portable-cabin-and-container/",
    "/blog/lincoln-portable-cabin-and-container/",
    "/blog/liverpool-portable-cabin-and-container/",
    "/blog/london-portable-cabin-and-container/",
    "/blog/manchester-portable-cabin-and-container/",
    "/blog/newcastle-portable-cabin-and-container/",
    "/blog/newport-portable-cabin-and-container/",
    "/blog/norwich-portable-cabin-and-container/",
    "/blog/nottingham-portable-cabin-and-container/",
    "/blog/oxford-portable-cabin-and-container/",
    "/blog/perth-portable-cabin-and-container/",
    "/blog/peterborough-portable-cabin-and-container/",
    "/blog/plymouth-portable-cabin-and-container/",
    "/blog/portable-cabins-on-private-land/",
    "/blog/portsmouth-portable-cabin-and-container/",
    "/blog/preston-portable-cabin-and-container/",
    "/blog/sheffield-portable-cabin-and-container/",
    "/blog/stirling-portable-cabin-and-container/",
    "/blog/stoke-on-trent-portable-cabin-and-container/",
    "/blog/sunderland-portable-cabin-and-container/",
    "/blog/swansea-portable-cabin-and-container/",
    "/blog/wakefield-portable-cabin-and-container/",
    "/blog/winchester-portable-cabin-and-container/",
    "/blog/wolverhampton-portable-cabin-and-container/",
    "/blog/worcester-portable-cabin-and-container/",
    "/blog/york-portable-cabin-and-container/",
    "/container/",
    "/flat-pack-container-k-1002/",
    "/flat-pack-container-k-2004/",
    "/flat-pack-container-k-2005/",
    "/flat-pack-container-k-3005/",
    "/portable-cabin-technical-specifications/",
  ],
};

const toPortableClassroom: RedirectGroup = {
  to: "/portable-cabin/portable-classroom/",
  status: 301,
  from: [
    "/modular-buildings/modular-school-buildings/",
  ],
};

const toPanelCabin: RedirectGroup = {
  to: "/panel-cabin/",
  status: 301,
  from: [
    "/panel-cabin-110x110/",
    "/panel-cabin-135x135/",
    "/panel-cabin-135x210/",
    "/panel-cabin-135x260/",
    "/panel-cabin-210x210/",
    "/panel-cabin-210x260/",
    "/panel-cabin-260x260/",
    "/prefabricated-shelter-140-140/",
    "/prefabricated-shelter-140-215/",
    "/prefabricated-shelter-215-215/",
    "/prefabricated-shelter-215-265/",
    "/prefabricated-shelter/",
  ],
};

const toBulletproofCabin: RedirectGroup = {
  to: "/bulletproof-cabin/",
  status: 301,
  from: [
    "/bulletproof-cabin-150x150/",
    "/bulletproof-cabin-150x200/",
    "/bulletproof-cabin-200x200/",
    "/bulletproof-cabin-200x300/",
    "/bulletproof-cabin-200x400/",
  ],
};

/** Groups whose target page is built today. Shipping a pending group = moving it here from PENDING_REDIRECT_GROUPS. */
export const REDIRECT_GROUPS: readonly RedirectGroup[] = [
  toHome,
  toAbout,
  toContact,
  toContactInterim,
  toProducts,
  toMetroCityCabins,
  toGallery,
  toRetailKiosks,
  toSecurityGatehouses,
  toCarParkCabins,
  toWelfareUnits,
  toAccommodationUnits,
  toGardenRooms,
  toTicketKiosks,
  toSiteOffices,
];

/** TSV rules held back until their target exists. Not written to `_redirects`. */
export const PENDING_REDIRECT_GROUPS: readonly RedirectGroup[] = [
  toPrivacyPolicy, // #22
  toGrpKioskCabin, // #23
  toPortableCabin, // #24
  toPortableClassroom, // #24
  toPanelCabin, // #24
  toBulletproofCabin, // #24
];

export function toRedirects(groups: readonly RedirectGroup[]): Redirect[] {
  return groups.flatMap(({ to, status, from }) => from.map((source) => ({ from: source, to, status })));
}

/** Every shipped rule, one per source. */
export const REDIRECTS: readonly Redirect[] = toRedirects(REDIRECT_GROUPS);
