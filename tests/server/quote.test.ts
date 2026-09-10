// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import quoteHandler from '~~/server/api/quote.post'
import { sendResendEmail } from '~~/server/utils/email'

vi.mock('~~/server/utils/email', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~~/server/utils/email')>()
  return {
    ...actual,
    sendResendEmail: vi.fn()
  }
})

// The Nuxt module `pinia-plugin-persistedstate/nuxt` normally auto-imports this global. Outside
// Nuxt's runtime it doesn't exist, so it's stubbed before the store module (which references it
// at store-definition time) is loaded. Mirrors tests/stores/quote.spec.ts.
;(globalThis as any).piniaPluginPersistedstate = { localStorage: () => undefined }
const { useQuoteStore } = await import('~/stores/quote')

describe('Quote Request API Endpoint', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.mocked(sendResendEmail).mockReset().mockResolvedValue({ success: true, simulated: true, id: 'mock_test_email' })
    setActivePinia(createPinia())
  })

  function createMockEvent(body: any) {
    return {
      context: {
        $mockBody: body
      }
    }
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
      customer: {
        name: 'David Miller', email: 'david@construction.co.uk',
        address: { townCity: 'Nottingham', postcode: 'NG1 1AA' }
      },
      items: [{
        productId: 'product-k1002', productName: 'K1002 Portable Cabin', quantity: 1,
        sizeKey: '', sizeLabel: 'Choose a size', isPortableContainer: true, hasSelectedSize: false
      }]
    })

    await expect(quoteHandler(event)).rejects.toThrow(/choose a size/i)
  })

  it('successfully processes valid quote request in simulated mode', async () => {
    const event = createMockEvent({
      customer: {
        name: 'David Miller',
        email: 'david@construction.co.uk',
        phone: '+44 7111 222333',
        company: 'Miller Developments',
        address: {
          formattedAddress: '10 High Street, Nottingham, NG1 1AA',
          addressLine1: '10 High Street',
          townCity: 'Nottingham',
          postcode: 'NG1 1AA'
        },
        notes: 'Urgent delivery needed.',
      },
      items: [
        {
          productName: 'Site Office Cabin 20ft',
          sizeLabel: '2.40m x 6.00m (Standard)',
          quantity: 1,
          basePrice: 8500,
          customTotal: 8500,
          notes: 'Standard double glazed'
        }
      ]
    })

    const response = await quoteHandler(event)

    expect(response).toBeDefined()
    expect(response.success).toBe(true)
    expect(response.simulated).toBe(true)
  })

  it('emails the customized price for a Size Option, not the price captured when it was added', async () => {
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
      selections: {},
      notes: {},
      total: 9800,
      isPoa: false,
      specSummary: [],
      lines: []
    })

    const event = createMockEvent({
      customer: {
        name: 'David Miller',
        email: 'david@construction.co.uk',
        address: {
          formattedAddress: '10 High Street, Nottingham, NG1 1AA',
          townCity: 'Nottingham',
          postcode: 'NG1 1AA'
        }
      },
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
  })
})
