import { defineStore } from 'pinia'
import type { SpecSummaryItem } from '~/types/customization'

export interface QuoteItem {
  id: string
  productId: string
  productName: string
  productSlug: string
  variantLabel: string
  basePrice?: number
  priceModifier?: number
  quantity: number
  notes?: string
  image?: string
  configState?: Record<string, any>
  customTotal?: number
  specSummary?: SpecSummaryItem[]
}

export interface QuoteCustomerInfo {
  name: string
  email: string
  phone: string
  company?: string
  notes?: string
}

export const useQuoteStore = defineStore('quote', {
  state: () => ({
    items: [] as QuoteItem[]
  }),

  getters: {
    totalItemsCount: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    totalQuotePrice: (state) => state.items.reduce((sum, item) => sum + ((item.customTotal ?? item.basePrice ?? 0) * item.quantity), 0),
    isEmpty: (state) => state.items.length === 0,
    getItemQuantity: (state) => (productId: string) => {
      const match = state.items.find(i => i.productId === productId)
      return match ? match.quantity : 0
    },
    getProductItem: (state) => (productId: string) => {
      return state.items.find(i => i.productId === productId)
    }
  },

  actions: {
    addItem(newItem: Omit<QuoteItem, 'id'>) {
      const compositeId = `${newItem.productId}-${newItem.variantLabel || 'base'}-${(newItem.notes || '').trim().toLowerCase()}`
      
      const existingIndex = this.items.findIndex(i => i.id === compositeId)
      if (existingIndex > -1) {
        this.items[existingIndex].quantity += newItem.quantity
      } else {
        this.items.push({
          ...newItem,
          id: compositeId,
          customTotal: newItem.customTotal ?? newItem.basePrice
        })
      }
    },

    incrementProduct(item: Omit<QuoteItem, 'id'>) {
      this.addItem({ ...item, quantity: 1 })
    },

    decrementProduct(productId: string) {
      const existing = this.items.find(i => i.productId === productId)
      if (existing) {
        if (existing.quantity > 1) {
          existing.quantity -= 1
        } else {
          this.removeItem(existing.id)
        }
      }
    },

    removeItem(id: string) {
      this.items = this.items.filter(item => item.id !== id)
    },

    updateQuantity(id: string, quantity: number) {
      if (quantity <= 0) {
        this.removeItem(id)
        return
      }
      const item = this.items.find(i => i.id === id)
      if (item) {
        item.quantity = quantity
      }
    },

    updateItemConfig(
      id: string,
      configState: Record<string, any>,
      customTotal: number,
      specSummary?: SpecSummaryItem[]
    ) {
      const item = this.items.find(i => i.id === id)
      if (item) {
        item.configState = configState
        item.customTotal = customTotal
        if (specSummary) {
          item.specSummary = specSummary
        }
      }
    },

    seedDefaultItems() {
      if (this.items.length === 0) {
        this.items = [
          {
            id: 'sec-std-gatehouse-default',
            productId: 'sec-std-gatehouse',
            productName: 'Karmod Standard Security Gatehouse 2.0m',
            productSlug: 'standard-gatehouse',
            variantLabel: 'Security Cabins',
            basePrice: 3100,
            customTotal: 3100,
            quantity: 1,
            image: '/images/product-service-cabin-135.png',
            specSummary: [
              { label: 'DIMENSIONS', value: '2.00m x 2.00m' },
              { label: 'WALL FINISH', value: 'Standard White (RAL 9002)' },
              { label: 'WINDOWS', value: '3 Glazed Panes' },
              { label: 'ELECTRICS', value: 'Integrated LED & Sockets' }
            ]
          }
        ]
      }
    },

    clearQuote() {
      this.items = []
    }
  },

  persist: {
    storage: piniaPluginPersistedstate.localStorage()
  }
})
