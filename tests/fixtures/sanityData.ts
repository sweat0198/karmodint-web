/** Builds a size render the way the catalogue import does: `_key` is the view name. */
export function mockSizeImage(view: string, assetId: string, alt: string) {
  return {
    _key: view,
    _type: 'image',
    view,
    alt,
    asset: { _type: 'reference', _ref: assetId }
  }
}

export const mockCategories = [
  {
    _id: 'cat_cabins',
    _type: 'category',
    name: 'Portable Cabins',
    slug: { _type: 'slug', current: 'portable-cabins' },
    description: 'Versatile modular cabins for office, security, and accommodation.',
    displayOrder: 1
  },
  {
    _id: 'cat_kiosks',
    _type: 'category',
    name: 'Retail & Catering Kiosks',
    slug: { _type: 'slug', current: 'kiosks' },
    description: 'Commercial sales kiosks, ticket booths, and food concession units.',
    displayOrder: 2
  }
]

export const mockCustomizationGroups = [
  {
    _id: 'group_electrical',
    _type: 'customizationGroup',
    title: 'Electrical & Lighting Package',
    identifier: { _type: 'slug', current: 'electricity' },
    selectionType: 'single',
    isMandatory: false,
    displayOrder: 1,
    items: [
      {
        _key: 'opt_std_elec',
        title: 'Standard UK Electrical Package',
        pricingType: 'fixed',
        price: 350,
        requiresTextInput: false
      },
      {
        _key: 'opt_prem_elec',
        title: 'Heavy Duty 32A Electrical Pack with LED panels',
        pricingType: 'fixed',
        price: 650,
        requiresTextInput: false
      }
    ]
  },
  {
    _id: 'group_hvac',
    _type: 'customizationGroup',
    title: 'Climate Control (HVAC)',
    identifier: { _type: 'slug', current: 'hvac' },
    selectionType: 'single',
    isMandatory: false,
    displayOrder: 2,
    items: [
      {
        _key: 'opt_ac_inverter',
        title: '9000 BTU Inverter A/C & Heating Unit',
        pricingType: 'fixed',
        price: 890,
        requiresTextInput: false
      },
      {
        _key: 'opt_custom_hvac',
        title: 'Bespoke Industrial HVAC Installation',
        pricingType: 'poa',
        price: 0,
        requiresTextInput: true,
        textInputPlaceholder: 'Describe required BTU / cooling specs...'
      }
    ]
  }
]

export const mockProducts = [
  {
    _id: 'prod_kiosk_150x150',
    _type: 'product',
    name: '1.50m x 1.50m Security Gatehouse Cabin',
    slug: { _type: 'slug', current: '1-50m-x-1-50m-security-cabin' },
    shortDescription: 'Compact security gatehouse cabin.',
    categories: [
      {
        _type: 'reference',
        _ref: 'cat_cabins'
      }
    ],
    status: 'published',
    isFeatured: true,
    sizes: [
      {
        _key: 'size_1',
        label: '1.50m x 1.50m (Compact)',
        lengthM: 1.5,
        widthM: 1.5,
        heightM: 2.4,
        weightKg: 280,
        isPoa: false,
        price: 2450,
        isDefault: true,
        images: [
          mockSizeImage('front', 'image-gatehouse150-front-png', '1.50m x 1.50m Security Gatehouse Cabin, 1.50m x 1.50m (Compact), front view'),
          mockSizeImage('interior', 'image-gatehouse150-interior-png', '1.50m x 1.50m Security Gatehouse Cabin, 1.50m x 1.50m (Compact), interior view'),
          mockSizeImage('top', 'image-gatehouse150-top-png', '1.50m x 1.50m Security Gatehouse Cabin, 1.50m x 1.50m (Compact), plan view from above')
        ]
      },
      {
        // POA size: price is a placeholder, so the catalog card query must exclude it from math::min.
        _key: 'size_2',
        label: '1.50m x 2.15m (Extended)',
        lengthM: 2.15,
        widthM: 1.5,
        heightM: 2.4,
        weightKg: 0,
        isPoa: true,
        price: 0,
        isDefault: false,
        images: [
          mockSizeImage('front', 'image-gatehouse215-front-png', '1.50m x 1.50m Security Gatehouse Cabin, 1.50m x 2.15m (Extended), front view'),
          mockSizeImage('top', 'image-gatehouse215-top-png', '1.50m x 1.50m Security Gatehouse Cabin, 1.50m x 2.15m (Extended), plan view from above')
        ]
      }
    ],
    customizationGroups: [
      { _type: 'reference', _ref: 'group_electrical' },
      { _type: 'reference', _ref: 'group_hvac' }
    ],
    seo: {
      metaTitle: '1.50m Security Gatehouse Cabin | Karmod UK',
      metaDescription: 'Buy heavy-duty modular security kiosks and gatehouses.'
    }
  },
  {
    _id: 'prod_kiosk_retail',
    _type: 'product',
    name: 'Retail Concession Food Kiosk 3.00m x 2.00m',
    slug: { _type: 'slug', current: 'retail-food-kiosk-300x200' },
    shortDescription: 'Modular food concession booth.',
    categories: [
      {
        _type: 'reference',
        _ref: 'cat_kiosks'
      }
    ],
    status: 'published',
    isFeatured: false,
    sizes: [
      {
        _key: 'size_retail_1',
        label: '3.00m x 2.00m Standard Hatch',
        lengthM: 3.0,
        widthM: 2.0,
        heightM: 2.5,
        weightKg: 0,
        isPoa: false,
        price: 5800,
        isDefault: true,
        images: [
          mockSizeImage('front', 'image-retail300-front-png', 'Retail Concession Food Kiosk 3.00m x 2.00m, 3.00m x 2.00m Standard Hatch, front view'),
          mockSizeImage('door', 'image-retail300-door-png', 'Retail Concession Food Kiosk 3.00m x 2.00m, 3.00m x 2.00m Standard Hatch, door detail'),
          mockSizeImage('top', 'image-retail300-top-png', 'Retail Concession Food Kiosk 3.00m x 2.00m, 3.00m x 2.00m Standard Hatch, plan view from above')
        ]
      }
    ],
    customizationGroups: [
      { _type: 'reference', _ref: 'group_electrical' }
    ],
    seo: {
      metaTitle: 'Retail Concession Kiosk | Karmod UK',
      metaDescription: 'Modular food concession booth for sale.'
    }
  }
]

export const mockQuoteEnquiries = [
  {
    _id: 'quote_001',
    _type: 'quoteEnquiry',
    referenceNumber: 'KQ-TEST01',
    status: 'new',
    customerName: 'John Smith',
    email: 'john@example.com',
    phone: '+44 7700 900077',
    company: 'Smith Logistics Ltd',
    deliveryLocation: 'Manchester M1 1AA',
    customerNotes: 'Need delivery within 2 weeks.',
    items: [
      {
        _type: 'quoteItem',
        _key: 'item_1',
        product: { _type: 'reference', _ref: 'prod_kiosk_150x150' },
        productTitle: '1.50m x 1.50m Security Gatehouse Cabin',
        sizeLabel: '1.50m x 1.50m (Compact)',
        quantity: 2,
        unitPrice: 2450,
        isPoa: false,
        subtotal: 4900
      }
    ],
    estimatedTotal: 4900,
    hasPoa: false,
    submittedAt: '2026-08-14T12:00:00.000Z'
  }
]

export const mockSanityDataset = [
  ...mockCategories,
  ...mockCustomizationGroups,
  ...mockProducts,
  ...mockQuoteEnquiries
]
