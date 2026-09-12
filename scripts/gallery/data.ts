/**
 * The curated gallery selection: which prepared photos become `galleryEntry` documents.
 *
 * This is an editorial list, not a rule over `manifest.json`. Which photos belong in the public
 * gallery, and which category each one sits under, is a judgement no filter reproduces — so the
 * selection is written down here and the photo's own copy is read from the manifest by `filePath`.
 */

export interface GallerySeed {
  /** Document `_id`. Deterministic so a re-import updates rather than duplicates. */
  id: string
  /** Repo-relative path, matching a `filePath` in `sanity/gallery/manifest.json`. */
  filePath: string
  /** `_id` of the `category` document this entry is filed under. */
  categoryId: string
  /** Gallery description. Title and alt text come from the manifest. */
  description: string
}

const SOURCE = 'sanity/gallery/source'

export const GALLERY_SEEDS: GallerySeed[] = [
  // Metro City ---------------------------------------------------------------
  {
    id: 'galleryEntry-metro-city-security-001',
    filePath: `${SOURCE}/cabins/security-guard/others/others-005.jpg`,
    categoryId: 'category-cabin-metro-city',
    description:
      'A Metro City gatehouse controlling the vehicle entrance to a car showroom, fitted with roof-mounted floodlighting and cameras for after-hours cover.'
  },
  {
    id: 'galleryEntry-metro-city-sariyer-hastane-001',
    filePath: `${SOURCE}/cabins/security-guard/sariyer-hastane/sariyer-hastane-001.jpg`,
    categoryId: 'category-cabin-metro-city',
    description:
      'A stone-effect Metro City booth stationed in the hospital car park at Sariyer, giving staff a sheltered post with clear sight lines across the entrance.'
  },
  {
    id: 'galleryEntry-metro-city-double-park-001',
    filePath: `${SOURCE}/cabins/security-guard/double-park/double-park-001.jpg`,
    categoryId: 'category-cabin-metro-city',
    description:
      'A Metro City cabin on the forecourt of the Double Park development, staffing the pedestrian and vehicle approach to the residential towers.'
  },
  {
    id: 'galleryEntry-metro-city-koc-muzesi-001',
    filePath: `${SOURCE}/cabins/security-guard/koc-muzesi/koc-muzesi-001.jpg`,
    categoryId: 'category-cabin-metro-city',
    description:
      'An olive green Metro City cabin at the waterfront entrance of the Rahmi M. Koc Museum, finished to sit quietly against the stone boundary wall.'
  },

  // GRP ----------------------------------------------------------------------
  {
    id: 'galleryEntry-grp-manchester-united-001',
    filePath: `${SOURCE}/cabins/retail-event-kiosk/manchester-united/manchester-united-001.jpg`,
    categoryId: 'category-cabin-grp',
    description:
      'Matchday programme kiosks in the red United Review livery at Old Trafford, sited on the approach to the East Stand turnstiles.'
  },
  {
    id: 'galleryEntry-grp-manchester-united-002',
    filePath: `${SOURCE}/cabins/retail-event-kiosk/manchester-united/manchester-united-002.jpg`,
    categoryId: 'category-cabin-grp',
    description:
      'The Old Trafford programme kiosks in their current black livery, showing how a GRP shell can be refinished to follow a change of club branding. Black finish available.'
  },
  {
    id: 'galleryEntry-grp-manchester-united-003',
    filePath: `${SOURCE}/cabins/retail-event-kiosk/manchester-united/manchester-united-003.jpg`,
    categoryId: 'category-cabin-grp',
    description:
      'A black programme kiosk sited below the East Stand at Old Trafford, compact enough to work within the stadium pedestrian flow. Black finish available.'
  },
  {
    id: 'galleryEntry-grp-manchester-united-004',
    filePath: `${SOURCE}/cabins/retail-event-kiosk/manchester-united/manchester-united-004.jpg`,
    categoryId: 'category-cabin-grp',
    description:
      'A pair of black programme kiosks under the concourse canopy at Old Trafford, set behind matchday crowd barriers. Black finish available.'
  },
  {
    id: 'galleryEntry-grp-production-001',
    filePath: `${SOURCE}/cabins/retail-event-kiosk/others/others-016.jpg`,
    categoryId: 'category-cabin-grp',
    description:
      'A white GRP kiosk photographed on the production floor before dispatch, showing the moulded one-piece shell and full-width sliding service window.'
  },
  {
    id: 'galleryEntry-grp-winter-001',
    filePath: `${SOURCE}/cabins/retail-event-kiosk/others/others-018.jpg`,
    categoryId: 'category-cabin-grp',
    description:
      'Two GRP cabins installed at a roadside in deep winter, the moulded shell shrugging off snow and freezing conditions without additional cladding.'
  },

  // Containers ---------------------------------------------------------------
  {
    id: 'galleryEntry-containers-ispanya-baba-001',
    filePath: `${SOURCE}/containers/office/ispanya-baba/ispanya-baba-001.jpg`,
    categoryId: 'category-containers',
    description:
      'Three container office units arranged along a paved yard in Spain, each raised on block footings with its own steps and secured windows.'
  },
  {
    id: 'galleryEntry-containers-office-001',
    filePath: `${SOURCE}/containers/office/others/others-009.jpg`,
    categoryId: 'category-containers',
    description:
      'A navy blue site office set on a poured concrete plinth, supplied as a full-length single unit for a city-centre development.'
  },
  {
    id: 'galleryEntry-containers-office-002',
    filePath: `${SOURCE}/containers/office/others/others-014.jpg`,
    categoryId: 'category-containers',
    description:
      'A two-storey container office block with an external staircase serving the upper floor, doubling the accommodation on the same ground footprint.'
  },
  {
    id: 'galleryEntry-containers-akalan-catalca-001',
    filePath: `${SOURCE}/containers/residential/akalan-catalca/akalan-catalca-001.jpg`,
    categoryId: 'category-containers',
    description:
      'A container house at Akalan Catalca sitting within a working garden, with a rooftop water tank and a shaded awning over the terrace.'
  },
  {
    id: 'galleryEntry-containers-almanya-ciftlik-001',
    filePath: `${SOURCE}/containers/residential/almanya-ciftlik/almanya-ciftlik-001.jpg`,
    categoryId: 'category-containers',
    description:
      'A container guesthouse photographed on handover, protective film still on the frames, with a fully fitted shower room behind the open door.'
  },
  {
    id: 'galleryEntry-containers-ankara-001',
    filePath: `${SOURCE}/containers/residential/ankara/ankara-001.jpg`,
    categoryId: 'category-containers',
    description:
      'A container house near Ankara with a deep canopy carried out over the concrete terrace, giving shaded outdoor living through the summer.'
  },
  {
    id: 'galleryEntry-containers-ankara-002',
    filePath: `${SOURCE}/containers/residential/ankara/ankara-002.jpg`,
    categoryId: 'category-containers',
    description:
      'A container house on the edge of harvested farmland near Ankara, raised on a concrete slab clear of the irrigated ground.'
  },
  {
    id: 'galleryEntry-containers-sevindikli-001',
    filePath: `${SOURCE}/containers/residential/sevindikli/sevindikli-001.jpg`,
    categoryId: 'category-containers',
    description:
      'A compact container house set in a mown woodland clearing at Sevindikli, served by a raised water tank for an off-grid plot.'
  },
  {
    id: 'galleryEntry-containers-residential-001',
    filePath: `${SOURCE}/containers/residential/others/others-002.jpg`,
    categoryId: 'category-containers',
    description:
      'A container unit raised clear of the ground on concrete footings in a tropical garden, specified for humid conditions and heavy rainfall.'
  },
  {
    id: 'galleryEntry-containers-residential-002',
    filePath: `${SOURCE}/containers/residential/others/others-003.jpg`,
    categoryId: 'category-containers',
    description:
      'A container home on a smallholding, fitted with a solid fuel flue and secured windows for year-round occupation away from mains services.'
  },
  {
    id: 'galleryEntry-containers-residential-003',
    filePath: `${SOURCE}/containers/residential/others/others-004.jpg`,
    categoryId: 'category-containers',
    description:
      'A container unit working as a poolside guest suite, opened up with a timber deck and a covered seating bay under the extended roof.'
  },
  {
    id: 'galleryEntry-containers-residential-004',
    filePath: `${SOURCE}/containers/residential/others/others-005.jpg`,
    categoryId: 'category-containers',
    description:
      'A container house finished into a landscaped plot, with block paving and planted borders carried right up to the canopied terrace.'
  },
  {
    id: 'galleryEntry-containers-residential-005',
    filePath: `${SOURCE}/containers/residential/others/others-007.jpg`,
    categoryId: 'category-containers',
    description:
      'The living room of a container house, with concealed cove lighting and a full-height window framing the garden - a finish indistinguishable from conventional construction.'
  },
  {
    id: 'galleryEntry-containers-residential-006',
    filePath: `${SOURCE}/containers/residential/others/others-008.jpg`,
    categoryId: 'category-containers',
    description:
      'A double bedroom inside a container house, finished with concealed cove lighting and a window onto woodland.'
  },
  {
    id: 'galleryEntry-containers-residential-007',
    filePath: `${SOURCE}/containers/residential/others/others-009.jpg`,
    categoryId: 'category-containers',
    description:
      'A container house part-way through installation on a levelled plot, the canopy and terrace already in place before the ground works are finished.'
  },
  {
    id: 'galleryEntry-containers-standard-001',
    filePath: `${SOURCE}/containers/standard-product/others/others-001.jpg`,
    categoryId: 'category-containers',
    description:
      'The standard container unit seen square-on, showing the door and window layout supplied as the default configuration.'
  },
  {
    id: 'galleryEntry-containers-standard-002',
    filePath: `${SOURCE}/containers/standard-product/others/others-002.jpg`,
    categoryId: 'category-containers',
    description:
      'The standard unit from three-quarters, showing the proportions of the shell and its corner post framing.'
  },
  {
    id: 'galleryEntry-containers-standard-003',
    filePath: `${SOURCE}/containers/standard-product/others/others-003.jpg`,
    categoryId: 'category-containers',
    description:
      'The same shell with the personnel door moved to the end bay, one of the standard door and window permutations.'
  },
  {
    id: 'galleryEntry-containers-standard-004',
    filePath: `${SOURCE}/containers/standard-product/others/others-004.jpg`,
    categoryId: 'category-containers',
    description:
      'A rear three-quarter view showing the blank elevation opposite the windows, available for back-to-back siting.'
  },
  {
    id: 'galleryEntry-containers-standard-005',
    filePath: `${SOURCE}/containers/standard-product/others/others-005.jpg`,
    categoryId: 'category-containers',
    description:
      'The blank elevation of a standard unit, ventilated but unglazed for units sited against a boundary.'
  },
  {
    id: 'galleryEntry-containers-standard-006',
    filePath: `${SOURCE}/containers/standard-product/others/others-006.jpg`,
    categoryId: 'category-containers',
    description:
      'A standard unit with the door open on delivery, showing the wood-effect flooring fitted as standard.'
  },
  {
    id: 'galleryEntry-containers-standard-007',
    filePath: `${SOURCE}/containers/standard-product/others/others-007.jpg`,
    categoryId: 'category-containers',
    description:
      'A WC compartment partitioned off inside a standard unit, plumbed and fitted before the unit leaves the factory.'
  },
  {
    id: 'galleryEntry-containers-standard-008',
    filePath: `${SOURCE}/containers/standard-product/others/others-008.jpg`,
    categoryId: 'category-containers',
    description:
      'The interior of a standard unit as delivered - lined, floored and glazed, ready for whatever fit-out the site requires.'
  },
  {
    id: 'galleryEntry-containers-standard-009',
    filePath: `${SOURCE}/containers/standard-product/others/others-010.jpg`,
    categoryId: 'category-containers',
    description:
      'An elevated view of a container camp, single-storey units laid out around paved walkways inside a walled compound.'
  },
  // Composite (KompoCity) ----------------------------------------------------
  {
    id: 'galleryEntry-composite-sipahi-kardesler-001',
    filePath: `${SOURCE}/cabins/security-guard/sipahi-kardesler/sipahi-kardesler-001.jpg`,
    categoryId: 'category-cabin-composite',
    description:
      'A KompoCity composite cabin at the front door of a Sipahi Kardesler office building, its deep roof overhang giving the guard shade over the approach without blocking the entrance.'
  },
  {
    id: 'galleryEntry-composite-sule-yuksel-senler-vakfi-001',
    filePath: `${SOURCE}/cabins/security-guard/sule-yuksel-senler-vakfi/sule-yuksel-senler-vakfi-001.jpg`,
    categoryId: 'category-cabin-composite',
    description:
      'A KompoCity cabin at the Sule Yuksel Senler Foundation, finished in cream so that a modern control point sits quietly in front of a listed building on a busy Istanbul street.'
  },
  {
    id: 'galleryEntry-composite-protein-ocean-gida-001',
    filePath: `${SOURCE}/cabins/security-guard/protein-ocean-gida/protein-ocean-gida-001.jpg`,
    categoryId: 'category-cabin-composite',
    description:
      'A KompoCity cabin delivered to the Protein Ocean food plant, still on its steel skids, with the roof fascia picked out in the plant colour.'
  },

  // Bulletproof --------------------------------------------------------------
  {
    id: 'galleryEntry-bulletproof-bmc-001',
    filePath: `${SOURCE}/cabins/security-guard/bmc/bmc-001.jpg`,
    categoryId: 'category-bulletproof',
    description:
      'An armoured gatehouse controlling the vehicle entrance at the BMC plant, sited on a raised plinth so the guard has sight lines the full width of the approach.'
  },
  {
    id: 'galleryEntry-bulletproof-arca-savunma-001',
    filePath: `${SOURCE}/cabins/security-guard/arca-savunma/arca-savunma-001.jpg`,
    categoryId: 'category-bulletproof',
    description:
      'An armoured observation cabin on open ground at Arca Savunma, with ballistic glazing on three sides and firing ports below each window.'
  },
  {
    id: 'galleryEntry-bulletproof-arca-savunma-002',
    filePath: `${SOURCE}/cabins/security-guard/arca-savunma/arca-savunma-002.jpg`,
    categoryId: 'category-bulletproof',
    description:
      'Inside the same Arca Savunma cabin: a full-length worktop under the glazing, so a post that has to be held for a long shift is somewhere a person can actually work.'
  },
  {
    id: 'galleryEntry-bulletproof-kuran-dekorasyon-001',
    filePath: `${SOURCE}/cabins/security-guard/kuran-dekorasyon/kuran-dekorasyon-001.jpg`,
    categoryId: 'category-bulletproof',
    description:
      'A composite-clad armoured cabin on a private forecourt, showing that ballistic protection and an armoured door need not read as a fortified box from the street.'
  },
  {
    id: 'galleryEntry-bulletproof-istanbul-finans-ifm-001',
    filePath: `${SOURCE}/cabins/security-guard/istanbul-finans-ifm/istanbul-finans-ifm-001.jpg`,
    categoryId: 'category-bulletproof',
    description:
      'An armoured gatehouse being set down on its plinth at the Istanbul Financial Centre, craned into position as a finished unit rather than built on site.'
  },

  // Metro City ---------------------------------------------------------------
  {
    id: 'galleryEntry-metro-city-turkiye-diyanet-vakfi-001',
    filePath: `${SOURCE}/cabins/security-guard/turkiye-diyanet-vakfi/turkiye-diyanet-vakfi-001.jpg`,
    categoryId: 'category-cabin-metro-city',
    description:
      'A Metro City cabin set under an existing pergola in a Turkiye Diyanet Foundation courtyard, its dark trim matched to the ironwork already on the site.'
  },
  {
    id: 'galleryEntry-metro-city-enpack-001',
    filePath: `${SOURCE}/cabins/security-guard/enpack/enpack-001.jpg`,
    categoryId: 'category-cabin-metro-city',
    description:
      'A Metro City cabin at the Enpack factory gate, placed beside the substation enclosure so the barrier and the switchgear are watched from one post.'
  },
  {
    id: 'galleryEntry-metro-city-firintas-balikesir-belediyesi-001',
    filePath: `${SOURCE}/cabins/retail-event-kiosk/firintas-balikesir-belediyesi/firintas-balikesir-belediyesi-001.jpg`,
    categoryId: 'category-cabin-metro-city',
    description:
      'A Metro City shell fitted out as a municipal bread kiosk in Balikesir, clad in timber-effect panels with a glazed display window and shelving behind it.'
  },
  {
    id: 'galleryEntry-metro-city-pirantech-001',
    filePath: `${SOURCE}/cabins/security-guard/pirantech/pirantech-001.jpg`,
    categoryId: 'category-cabin-metro-city',
    description:
      'A Metro City cabin at Pirantech supplied with a separate WC cubicle and a linking canopy, so a single-person post does not have to be left unmanned.'
  },
  {
    id: 'galleryEntry-metro-city-mosb-enerji-001',
    filePath: `${SOURCE}/cabins/security-guard/mosb-enerji/mosb-enerji-001.jpg`,
    categoryId: 'category-cabin-metro-city',
    description:
      'A larger Metro City unit working as a site office at Mosb Enerji, finished in the company red and grey and raised on a kerb clear of surface water.'
  },
  {
    id: 'galleryEntry-metro-city-mosb-enerji-002',
    filePath: `${SOURCE}/cabins/security-guard/mosb-enerji/mosb-enerji-002.jpg`,
    categoryId: 'category-cabin-metro-city',
    description:
      'The interior of the Mosb Enerji office: two desk positions along a continuous worktop, storage and full-width glazing onto the yard being watched.'
  },
  {
    id: 'galleryEntry-metro-city-marmara-universitesi-001',
    filePath: `${SOURCE}/cabins/security-guard/marmara-universitesi/marmara-universitesi-001.jpg`,
    categoryId: 'category-cabin-metro-city',
    description:
      'A Metro City gatehouse on the vehicle entrance to the Marmara University campus, holding the barrier line in winter weather.'
  },
  {
    id: 'galleryEntry-metro-city-marmara-universitesi-002',
    filePath: `${SOURCE}/cabins/security-guard/marmara-universitesi/marmara-universitesi-002.jpg`,
    categoryId: 'category-cabin-metro-city',
    description:
      'A second Marmara University cabin on a pedestrian gate, finished in a paler grey to suit a landscaped approach rather than a service road.'
  }
]
