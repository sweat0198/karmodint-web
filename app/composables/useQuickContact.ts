import { computed } from 'vue'
import { useQuoteStore } from '~/stores/quote'

export const BUSINESS_PHONE_RAW = '+447824810226'
export const BUSINESS_PHONE_DISPLAY = '+44 7824 810226'
export const BUSINESS_WHATSAPP_NUMBER = '447824810226'

export function useQuickContact() {
  const quoteStore = useQuoteStore()

  const whatsAppMessage = computed(() => {
    if (quoteStore.isEmpty || quoteStore.items.length === 0) {
      return 'Hi Karmod UK, I would like to inquire about modular building solutions and custom cabin configurations.'
    }

    const itemsSummary = quoteStore.items
      .map((item, index) => {
        const price = item.customTotal ?? item.basePrice
        const priceStr = price ? ` (£${(price * item.quantity).toLocaleString()})` : ''
        const title = `*${index + 1}. ${item.quantity}x ${item.productName}*${priceStr}`
        
        let specs = ''
        if (item.specSummary && item.specSummary.length > 0) {
          specs = '\n' + item.specSummary
            .map(s => `   - ${s.label}: ${s.value}`)
            .join('\n')
        }

        return `${title}${specs}`
      })
      .join('\n\n')

    const totalStr = `£${quoteStore.totalQuotePrice.toLocaleString()}`

    return [
      'Hi Karmod UK, I would like to discuss my quotation request:',
      '',
      '*Selected Units & Specifications:*',
      itemsSummary,
      '',
      `*Estimated Total: ${totalStr} (+ VAT & Delivery)*`,
      '',
      'Could you please advise on lead time and delivery schedule?'
    ].join('\n')
  })

  const whatsAppUrl = computed(() => {
    const encoded = encodeURIComponent(whatsAppMessage.value)
    return `https://wa.me/${BUSINESS_WHATSAPP_NUMBER}?text=${encoded}`
  })

  const phoneTelHref = computed(() => `tel:${BUSINESS_PHONE_RAW}`)

  return {
    phoneDisplay: BUSINESS_PHONE_DISPLAY,
    phoneTelHref,
    whatsAppUrl,
    whatsAppMessage,
    hasQuoteItems: computed(() => quoteStore.totalItemsCount > 0),
    quoteCount: computed(() => quoteStore.totalItemsCount)
  }
}
