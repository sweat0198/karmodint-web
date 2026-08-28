export interface ReferenceSeed {
  id: string
  companyName: string
  location?: string
  logoPath: string
  website?: string
  displayOrder: number
  published: boolean
}

export const REFERENCE_SEEDS: ReferenceSeed[] = [
  { id: 'reference-w-hotel-edinburgh', companyName: 'W Hotel Edinburgh', location: 'Edinburgh, Scotland', logoPath: 'public/images/references/w-hotel.svg', website: 'https://www.marriott.com/en-gb/hotels/ediwh-w-edinburgh/overview/', displayOrder: 10, published: true },
  { id: 'reference-west-haddon-council', companyName: 'West Haddon Council', location: 'Cricket Ground, Northampton', logoPath: 'public/images/references/west-haddon-council.svg', website: 'https://www.pitchero.com/clubs/haddoncc/', displayOrder: 20, published: false },
  { id: 'reference-canary-wharf-management', companyName: 'Canary Wharf Management', location: 'London', logoPath: 'public/images/references/canary-wharf.svg', website: 'https://canarywharf.com/', displayOrder: 30, published: true },
  { id: 'reference-leicestershire-ccc', companyName: 'Leicestershire County Cricket Club', location: 'Leicester', logoPath: 'public/images/references/leicestershire-ccc-crest.svg', website: 'https://leicestershireccc.co.uk/', displayOrder: 40, published: true },
  { id: 'reference-bournemouth-airport', companyName: 'Bournemouth Airport', location: 'Bournemouth', logoPath: 'public/images/references/bournemouth-airport.svg', website: 'https://www.bournemouthairport.com/', displayOrder: 50, published: true },
  { id: 'reference-osi-contracts', companyName: 'OSI Contracts', location: 'Havana, Cuba', logoPath: 'public/images/references/osi-contracts.png', website: 'https://orostream.co.uk/', displayOrder: 60, published: true },
  { id: 'reference-birmingham-wholesale-market', companyName: 'Birmingham Wholesale Market', location: 'Birmingham', logoPath: 'public/images/references/birmingham-wholesale-market.png', website: 'https://birminghamwholesalemarket.company/', displayOrder: 70, published: true },
  { id: 'reference-luton-sea-cadet', companyName: 'Luton Sea Cadet', location: 'Luton', logoPath: 'public/images/references/luton-sea-cadet.png', website: 'https://www.sea-cadets.org/luton', displayOrder: 80, published: false }
]
