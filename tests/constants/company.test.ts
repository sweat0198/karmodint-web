import { describe, expect, it } from 'vitest'
import { COMPANY_CONTACT } from '~/constants/company'

describe('COMPANY_CONTACT', () => {
  it('uses info address for customer support', () => {
    expect(COMPANY_CONTACT.supportEmail).toBe('info@karmodint.co.uk')
  })
})
