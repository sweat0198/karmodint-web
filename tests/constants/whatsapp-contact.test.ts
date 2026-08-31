import { describe, expect, it } from 'vitest'
import { COMPANY_CONTACT } from '~/constants/company'

describe('COMPANY_CONTACT WhatsApp details', () => {
  it('uses the current WhatsApp contact details', () => {
    expect(COMPANY_CONTACT.whatsAppNumber).toBe('447359538937')
    expect(COMPANY_CONTACT.whatsAppDisplay).toBe('+44 7359 538937')
    expect(COMPANY_CONTACT.whatsAppUrl).toBe('https://wa.me/447359538937')
  })
})
