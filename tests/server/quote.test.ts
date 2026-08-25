import { describe, it, expect, vi, beforeEach } from 'vitest'
import quoteHandler from '~~/server/api/quote.post'

describe('Quote Request API Endpoint', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
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
          unitPrice: 8500,
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
})
