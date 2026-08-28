export interface ClientReference {
  id: string;
  name: string;
  location: string;
  category: 'Hospitality' | 'Public Sector' | 'Commercial & Infrastructure' | 'Sports & Leisure' | 'Aviation' | 'Defense & Marine';
  logoUrl: string;
  logoAlt: string;
}

export const CLIENT_REFERENCES: ClientReference[] = [
  {
    id: 'w-hotel-edinburgh',
    name: 'W Hotel Edinburgh',
    location: 'Edinburgh, Scotland',
    category: 'Hospitality',
    logoUrl: '/images/references/w-hotel.svg',
    logoAlt: 'W Hotels Edinburgh Logo',
  },
  {
    id: 'west-haddon-council',
    name: 'West Haddon Council',
    location: 'Cricket Ground, Northampton',
    category: 'Public Sector',
    logoUrl: '/images/references/west-haddon-council.svg',
    logoAlt: 'West Haddon Council Crest',
  },
  {
    id: 'canary-wharf-management',
    name: 'Canary Wharf Management',
    location: 'London',
    category: 'Commercial & Infrastructure',
    logoUrl: '/images/references/canary-wharf-icon.png',
    logoAlt: 'Canary Wharf Management Logo',
  },
  {
    id: 'leicestershire-ccc',
    name: 'Leicestershire County Cricket Club',
    location: 'Leicester',
    category: 'Sports & Leisure',
    logoUrl: '/images/references/leicestershire-ccc-crest.svg',
    logoAlt: 'Leicestershire County Cricket Club Crest',
  },
  {
    id: 'bournemouth-airport',
    name: 'Bournemouth Airport',
    location: 'Bournemouth',
    category: 'Aviation',
    logoUrl: '/images/references/bournemouth-airport.svg',
    logoAlt: 'Bournemouth Airport Logo',
  },
  {
    id: 'osi-contracts',
    name: 'OSI Contracts',
    location: 'Havana, Cuba',
    category: 'Commercial & Infrastructure',
    logoUrl: '/images/references/osi-contracts.png',
    logoAlt: 'OSI Contracts Logo',
  },
  {
    id: 'birmingham-wholesale-market',
    name: 'Birmingham Wholesale Market',
    location: 'Birmingham',
    category: 'Commercial & Infrastructure',
    logoUrl: '/images/references/birmingham-wholesale-market.png',
    logoAlt: 'Birmingham Wholesale Market Logo',
  },
  {
    id: 'luton-sea-cadet',
    name: 'Luton Sea Cadet',
    location: 'Luton',
    category: 'Defense & Marine',
    logoUrl: '/images/references/luton-sea-cadet.png',
    logoAlt: 'Luton Sea Cadets Logo',
  },
];
