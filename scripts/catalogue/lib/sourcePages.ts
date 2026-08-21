/**
 * The 33 source pages behind the whole catalogue import.
 *
 * All five families are listed even though ticket 02 only imports GRP, because one cached crawl
 * means tickets 03-06 need no network access at all. The Turkish Panel pages are here for the same
 * reason: Karmod never translated those five detail panes, so the Turkish originals are the only
 * copy source that exists.
 *
 * `sizeKey` is the `AxB` token used everywhere downstream — manifest key, size `_key`, render
 * folder suffix — and reads Depth A x Width B, which is why `lengthM` takes A and `widthM` takes B.
 */

export type SourceLang = 'en' | 'tr'

export interface SourcePage {
  /** Manifest product id this page describes one size of. */
  productId: string
  /** `AxB` size token, in centimetres. */
  sizeKey: string
  lang: SourceLang
  url: string
}

const EN = 'https://karmodkabin.com/en/product'
const TR = 'https://karmodkabin.com/urun'

/** GRP publishes the only spec lists on the site; `270x270` sits under a different slug prefix. */
const GRP_CABIN: SourcePage[] = [
  { productId: 'product-grp-cabin', sizeKey: '150x150', lang: 'en', url: `${EN}/polyester-cabin-150x150/` },
  { productId: 'product-grp-cabin', sizeKey: '150x215', lang: 'en', url: `${EN}/polyester-cabin-150x215/` },
  { productId: 'product-grp-cabin', sizeKey: '150x270', lang: 'en', url: `${EN}/polyester-cabin-150x270/` },
  { productId: 'product-grp-cabin', sizeKey: '215x270', lang: 'en', url: `${EN}/polyester-cabin-215x270/` },
  { productId: 'product-grp-cabin', sizeKey: '270x270', lang: 'en', url: `${EN}/wide-cabin-270x270/` }
]

/** The English detail panes are empty for every Panel size, hence the Turkish pages below. */
const PANEL_CABIN: SourcePage[] = [
  { productId: 'product-panel-cabin', sizeKey: '110x110', lang: 'en', url: `${EN}/panel-cabin-110x110/` },
  { productId: 'product-panel-cabin', sizeKey: '135x135', lang: 'en', url: `${EN}/panel-cabin-135x135/` },
  { productId: 'product-panel-cabin', sizeKey: '135x210', lang: 'en', url: `${EN}/panel-cabin-135x210/` },
  { productId: 'product-panel-cabin', sizeKey: '210x210', lang: 'en', url: `${EN}/panel-cabin-210x210/` },
  { productId: 'product-panel-cabin', sizeKey: '260x260', lang: 'en', url: `${EN}/panel-cabin-260x260/` },
  { productId: 'product-panel-cabin', sizeKey: '110x110', lang: 'tr', url: `${TR}/panel-kabin-110x110/` },
  { productId: 'product-panel-cabin', sizeKey: '135x135', lang: 'tr', url: `${TR}/panel-kabin-135x135/` },
  { productId: 'product-panel-cabin', sizeKey: '135x210', lang: 'tr', url: `${TR}/panel-kabin-135x210/` },
  { productId: 'product-panel-cabin', sizeKey: '210x210', lang: 'tr', url: `${TR}/panel-kabin-210x210/` },
  { productId: 'product-panel-cabin', sizeKey: '260x260', lang: 'tr', url: `${TR}/panel-kabin-260x260/` }
]

const METRO_CITY_CABIN: SourcePage[] = [
  { productId: 'product-metro-city-cabin', sizeKey: '140x140', lang: 'en', url: `${EN}/metro-city-cabin-140x140/` },
  { productId: 'product-metro-city-cabin', sizeKey: '140x215', lang: 'en', url: `${EN}/metro-city-cabin-140x215/` },
  { productId: 'product-metro-city-cabin', sizeKey: '215x215', lang: 'en', url: `${EN}/metro-city-cabin-215x215/` },
  { productId: 'product-metro-city-cabin', sizeKey: '215x265', lang: 'en', url: `${EN}/metro-city-cabin-215x265/` },
  { productId: 'product-metro-city-cabin', sizeKey: '265x265', lang: 'en', url: `${EN}/metro-city-cabin-265x265/` }
]

/** KompoCity, not MetroLux — see ticket 05 for why the composite renders map to this line. */
const KOMPO_CITY_CABIN: SourcePage[] = [
  { productId: 'product-kompocity-cabin', sizeKey: '140x140', lang: 'en', url: `${EN}/140x140-kompocity/` },
  { productId: 'product-kompocity-cabin', sizeKey: '140x215', lang: 'en', url: `${EN}/140x215-kompocity/` },
  { productId: 'product-kompocity-cabin', sizeKey: '215x215', lang: 'en', url: `${EN}/215x215-kompocity/` },
  { productId: 'product-kompocity-cabin', sizeKey: '215x265', lang: 'en', url: `${EN}/215x265-kompocity/` },
  { productId: 'product-kompocity-cabin', sizeKey: '265x265', lang: 'en', url: `${EN}/265x265-kompocity/` }
]

const BULLETPROOF_CABIN: SourcePage[] = [
  { productId: 'product-bulletproof-cabin', sizeKey: '150x150', lang: 'en', url: `${EN}/armored-cabin-150x150/` },
  { productId: 'product-bulletproof-cabin', sizeKey: '150x200', lang: 'en', url: `${EN}/armored-cabin-150x200/` },
  { productId: 'product-bulletproof-cabin', sizeKey: '200x200', lang: 'en', url: `${EN}/armored-cabin-200x200/` },
  { productId: 'product-bulletproof-cabin', sizeKey: '200x300', lang: 'en', url: `${EN}/armored-cabin-200x300/` },
  { productId: 'product-bulletproof-cabin', sizeKey: '200x400', lang: 'en', url: `${EN}/armored-cabin-200x400/` },
  { productId: 'product-bulletproof-cabin', sizeKey: '300x300', lang: 'en', url: `${EN}/armored-cabin-300x300/` },
  { productId: 'product-bulletproof-cabin', sizeKey: '300x400', lang: 'en', url: `${EN}/armored-cabin-300x400/` },
  { productId: 'product-bulletproof-cabin', sizeKey: '300x500', lang: 'en', url: `${EN}/armored-cabin-300x500/` }
]

export const SOURCE_PAGES: SourcePage[] = [
  ...GRP_CABIN,
  ...PANEL_CABIN,
  ...METRO_CITY_CABIN,
  ...KOMPO_CITY_CABIN,
  ...BULLETPROOF_CABIN
]

/**
 * Stable cache filename for a page.
 *
 * Derived from the fields that identify the page rather than from the URL, so a cache entry stays
 * matched to its manifest row even if the source site moves a slug.
 */
export function cacheFileName(page: SourcePage): string {
  return `${page.productId}--${page.sizeKey}--${page.lang}.html`
}
