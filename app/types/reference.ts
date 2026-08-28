export interface ReferenceLogo {
  _type?: 'image'
  asset?: {
    _type: 'reference'
    _ref: string
  }
}

export interface ClientReference {
  _id: string
  companyName: string
  location?: string
  logo: ReferenceLogo
  website?: string
  displayOrder?: number
}

export interface ReferenceTile {
  _id: string
  companyName: string
  location?: string
  logoUrl: string
  website?: string
}
