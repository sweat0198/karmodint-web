// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import quoteHandler from '~~/server/api/quote.post'
import { sendResendEmail } from '~~/server/utils/email'
import { writeSanityQuoteEnquiry } from '~~/server/utils/sanityLead'
import { fetchProductsForValidation } from '~~/server/utils/sanityProductQuery'
import type { SanityProduct } from '~~/app/types/catalog'

vi.mock('~~/server/utils/email', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~~/server/utils/email')>()
  return {
    ...actual,
    sendResendEmail: vi.fn()
  }
})

vi.mock('~~/server/utils/sanityLead', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~~/server/utils/sanityLead')>()
  return {
    ...actual,
    writeSanityQuoteEnquiry: vi.fn()
  }
})

vi.mock('~~/server/utils/sanityProductQuery', () => ({
  fetchProductsForValidation: vi.fn()
}))

// The Nuxt module `pinia-plugin-persistedstate/nuxt` normally auto-imports this global. Outside
// Nuxt's runtime it doesn't exist, so it's stubbed before the store module (which references it
// at store-definition time) is loaded. Mirrors tests/stores/quote.spec.ts.
;(globalThis as any).piniaPluginPersistedstate = { localStorage: () => undefined }
const { useQuoteStore } = await import('~/stores/quote')

const CABIN_PRODUCT: SanityProduct = {
  _id: 'site-office-cabin-20ft',
  _type: 'product',
  name: 'Site Office Cabin 20ft',
  slug: { current: 'site-office-cabin-20ft' },
  categories: [],
  status: 'published',
  sizes: [
    { _key: 'standard', label: '2.40m x 6.00m (Standard)', lengthM: 6, widthM: 2.4, price: 8500, isPoa: false, images: [] }
  ],
  customizationConfigurations: [
    {
      group: {
        _id: 'grp-electrical',
        _type: 'customizationGroup',
        title: 'Electrical Package',
        identifier: 'electrical',
        selectionType: 'single',
        items: [
          { _key: 'standard-elec', title: 'Standard package', pricingType: 'included' },
          { _key: 'upgraded-elec', title: 'Upgraded electrical package', pricingType: 'fixed', price: 1300 }
        ]
      },
      itemOverrides: []
    }
  ]
}

function productsMap(...products: SanityProduct[]) {
  return new Map(products.map((p) => [p._id, p]))
}

describe('Quote Request API Endpoint', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.mocked(sendResendEmail).mockReset().mockResolvedValue({ success: true, simulated: true, id: 'mock_test_email' })
    vi.mocked(writeSanityQuoteEnquiry).mockReset().mockResolvedValue({ id: 'mock-sanity-id' })
    vi.mocked(fetchProductsForValidation).mockReset().mockResolvedValue(productsMap(CABIN_PRODUCT))
    setActivePinia(createPinia())
  })

  function createMockEvent(body: any) {
    return {
      context: {
        $mockBody: body
      }
    }
  }

  const validCustomer = {
    name: 'David Miller',
    email: 'david@construction.co.uk',
    address: { formattedAddress: '10 High Street, Nottingham, NG1 1AA', townCity: 'Nottingham', postcode: 'NG1 1AA' }
  }

  it('rejects submissions with missing customer name, email, or items', async () => {
    const event = createMockEvent({
      customer: { name: '', email: '' },
      items: []
    })

    await expect(quoteHandler(event)).rejects.toThrow(/Invalid quote submission/i)
  })

  it('rejects submissions without a delivery destination', async () => {
    const event = createMockEvent({
      customer: {
        name: 'David Miller',
        email: 'david@construction.co.uk',
        address: ''
      },
      items: [{ productName: 'Site Office Cabin 20ft', quantity: 1 }]
    })

    await expect(quoteHandler(event)).rejects.toThrow(/delivery destination/i)
  })

  it('rejects a portable-container line whose required size remains unresolved', async () => {
    const event = createMockEvent({
      customer: validCustomer,
      items: [{
        productId: 'product-k1002', productName: 'K1002 Portable Cabin', quantity: 1,
        sizeKey: '', sizeLabel: 'Choose a size', isPortableContainer: true, hasSelectedSize: false
      }]
    })

    await expect(quoteHandler(event)).rejects.toThrow(/choose a size/i)
  })

  it('rejects an item that does not reference a Product and Size Option', async () => {
    const event = createMockEvent({
      customer: validCustomer,
      items: [{ productName: 'Site Office Cabin 20ft', sizeLabel: 'Standard', quantity: 1, basePrice: 8500 }]
    })

    await expect(quoteHandler(event)).rejects.toThrow(/Product and Size Option/i)
  })

  it('successfully processes a valid quote request whose price matches current Sanity data', async () => {
    const event = createMockEvent({
      customer: validCustomer,
      items: [
        {
          productId: 'site-office-cabin-20ft',
          productName: 'Site Office Cabin 20ft',
          sizeKey: 'standard',
          sizeLabel: '2.40m x 6.00m (Standard)',
          quantity: 1,
          basePrice: 8500,
          customTotal: 8500
        }
      ]
    })

    const response = await quoteHandler(event)

    expect(response).toBeDefined()
    expect(response.success).toBe(true)
    expect(response.simulated).toBe(true)
    expect(response.sanityLeadId).toBe('mock-sanity-id')
    expect(writeSanityQuoteEnquiry).toHaveBeenCalledTimes(1)
    expect(sendResendEmail).toHaveBeenCalledTimes(2)
  })

  it('emails and saves the price the server resolves from Sanity, not the price captured when it was added', async () => {
    // Build the payload the way the Quote List page actually does: through the Quote List store,
    // added at one price then customized to a different one (app/stores/quote.ts addItem /
    // updateItemConfig), not a hand-typed price fixture.
    const store = useQuoteStore()
    store.addItem({
      productId: 'site-office-cabin-20ft',
      productName: 'Site Office Cabin 20ft',
      productSlug: 'site-office-cabin-20ft',
      sizeKey: 'standard',
      sizeLabel: '2.40m x 6.00m (Standard)',
      basePrice: 8500,
      quantity: 1
    })
    const addedLine = store.items[0]
    store.updateItemConfig(addedLine.id, {
      selections: { 'grp-electrical': 'upgraded-elec' },
      notes: {},
      total: 9800,
      isPoa: false,
      specSummary: [],
      lines: [{
        groupId: 'grp-electrical',
        groupTitle: 'Electrical Package',
        itemKey: 'upgraded-elec',
        optionTitle: 'Upgraded electrical package',
        price: 1300,
        isPoa: false,
        pricingType: 'fixed',
        priceSource: 'itemDefault'
      }]
    })

    const event = createMockEvent({
      customer: validCustomer,
      items: store.items
    })

    await quoteHandler(event)

    expect(sendResendEmail).toHaveBeenCalledTimes(2)
    const [businessEmail] = vi.mocked(sendResendEmail).mock.calls[0]
    const [customerEmail] = vi.mocked(sendResendEmail).mock.calls[1]

    for (const email of [businessEmail, customerEmail]) {
      expect(email.html).toContain('£9,800')
      expect(email.html).not.toContain('£8,500')
    }

    const [savedDoc] = vi.mocked(writeSanityQuoteEnquiry).mock.calls[0]
    expect(savedDoc.items[0].subtotal).toBe(9800)
  })

  it('stops submission and reports old and current ex-VAT prices when Sanity pricing has changed', async () => {
    const event = createMockEvent({
      customer: validCustomer,
      items: [
        {
          productId: 'site-office-cabin-20ft',
          productName: 'Site Office Cabin 20ft',
          sizeKey: 'standard',
          sizeLabel: '2.40m x 6.00m (Standard)',
          quantity: 1,
          basePrice: 7000,
          customTotal: 7000
        }
      ]
    })

    await expect(quoteHandler(event)).rejects.toMatchObject({
      statusCode: 409,
      data: {
        code: 'price_changed',
        changes: [expect.objectContaining({ oldUnitPrice: 7000, newUnitPrice: 8500 })]
      }
    })
    expect(writeSanityQuoteEnquiry).not.toHaveBeenCalled()
    expect(sendResendEmail).not.toHaveBeenCalled()
  })

  it('lets the customer confirm a recalculated price and always saves/emails the server-derived value, never the tampered one', async () => {
    const event = createMockEvent({
      customer: validCustomer,
      confirmedPrices: true,
      items: [
        {
          productId: 'site-office-cabin-20ft',
          productName: 'Site Office Cabin 20ft',
          sizeKey: 'standard',
          sizeLabel: '2.40m x 6.00m (Standard)',
          quantity: 1,
          basePrice: 1,
          customTotal: 1
        }
      ]
    })

    const response = await quoteHandler(event)

    expect(response.success).toBe(true)
    const [savedDoc] = vi.mocked(writeSanityQuoteEnquiry).mock.calls[0]
    expect(savedDoc.items[0].unitPrice).toBe(8500)
    expect(savedDoc.items[0].unitPrice).not.toBe(1)
  })

  it('stops submission with a 409 identifying the line and selection when a customization is no longer available', async () => {
    const event = createMockEvent({
      customer: validCustomer,
      items: [
        {
          productId: 'site-office-cabin-20ft',
          productName: 'Site Office Cabin 20ft',
          sizeKey: 'standard',
          sizeLabel: '2.40m x 6.00m (Standard)',
          quantity: 1,
          basePrice: 8500,
          customTotal: 9800,
          selectedCustomizations: [{
            groupId: 'grp-electrical',
            groupTitle: 'Electrical Package',
            itemKey: 'discontinued-elec',
            optionTitle: 'Discontinued electrical package',
            price: 1300,
            isPoa: false
          }]
        }
      ]
    })

    await expect(quoteHandler(event)).rejects.toMatchObject({
      statusCode: 409,
      data: {
        code: 'unavailable',
        issues: [expect.objectContaining({ groupTitle: 'Electrical Package', optionTitle: 'Discontinued electrical package' })]
      }
    })
    expect(writeSanityQuoteEnquiry).not.toHaveBeenCalled()
    expect(sendResendEmail).not.toHaveBeenCalled()
  })

  it('returns a 500 and does not email when Sanity pricing validation cannot be reached', async () => {
    vi.mocked(fetchProductsForValidation).mockRejectedValue(new Error('network error'))

    const event = createMockEvent({
      customer: validCustomer,
      items: [{
        productId: 'site-office-cabin-20ft', productName: 'Site Office Cabin 20ft',
        sizeKey: 'standard', sizeLabel: 'Standard', quantity: 1, basePrice: 8500
      }]
    })

    await expect(quoteHandler(event)).rejects.toThrow(/validate quote pricing/i)
    expect(sendResendEmail).not.toHaveBeenCalled()
  })

  it('returns a 500 and does not email when the Quote Enquiry fails to save', async () => {
    vi.mocked(writeSanityQuoteEnquiry).mockRejectedValue(new Error('sanity write failed'))

    const event = createMockEvent({
      customer: validCustomer,
      items: [{
        productId: 'site-office-cabin-20ft', productName: 'Site Office Cabin 20ft',
        sizeKey: 'standard', sizeLabel: 'Standard', quantity: 1, basePrice: 8500
      }]
    })

    await expect(quoteHandler(event)).rejects.toThrow(/save your quote enquiry/i)
    expect(sendResendEmail).not.toHaveBeenCalled()
  })
})
