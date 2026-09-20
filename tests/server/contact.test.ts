import { describe, it, expect, vi, beforeEach } from 'vitest'

// Setup Nuxt/Nitro globals for standalone unit testing
globalThis.defineEventHandler = (fn: any) => fn
globalThis.readBody = async (event: any) => event?.context?.$mockBody || {}
globalThis.createError = (err: any) => Object.assign(new Error(err.statusMessage), err)
globalThis.useRuntimeConfig = () => ({
  resendApiKey: '',
  businessEmail: 'enquiries@karmod-international.com'
})

import contactHandler from '~~/server/api/contact.post'

describe('Contact / Info Mail API Endpoint', () => {
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

  it('rejects submissions with missing full name or email', async () => {
    const event = createMockEvent({
      fullName: '',
      email: 'invalid',
      details: ''
    })

    await expect(contactHandler(event)).rejects.toThrow(/Invalid contact submission/i)
  })

  it('rejects submissions with a missing or whitespace-only company/organization', async () => {
    const missingCompany = createMockEvent({
      fullName: 'Jane Doe',
      email: 'jane@acme.com',
      details: 'Interested in bespoke 6x3m kiosks.'
    })
    const blankCompany = createMockEvent({
      fullName: 'Jane Doe',
      companyName: '   ',
      email: 'jane@acme.com',
      details: 'Interested in bespoke 6x3m kiosks.'
    })

    await expect(contactHandler(missingCompany)).rejects.toThrow(/Invalid contact submission/i)
    await expect(contactHandler(blankCompany)).rejects.toThrow(/Invalid contact submission/i)
  })

  it('accepts submissions with no phone number, since phone is the one optional field', async () => {
    const event = createMockEvent({
      fullName: 'Jane Doe',
      companyName: 'Acme Infra Ltd',
      email: 'jane@acme.com',
      details: 'Interested in bespoke 6x3m kiosks.'
    })

    const response = await contactHandler(event)
    expect(response.success).toBe(true)
  })

  it('successfully processes valid contact submission in simulated/mock mode', async () => {
    const event = createMockEvent({
      fullName: 'Jane Doe',
      companyName: 'Acme Infra Ltd',
      email: 'jane@acme.com',
      phone: '+44 7123 456789',
      details: 'Interested in bespoke 6x3m kiosks.'
    })

    const response = await contactHandler(event)

    expect(response).toBeDefined()
    expect(response.success).toBe(true)
    expect(response.message).toContain('received')
    expect(response.simulated).toBe(true)
  })
})
