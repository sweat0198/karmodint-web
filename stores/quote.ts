import { defineStore } from 'pinia'

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
    isEmpty: (state) => state.items.length === 0
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
          id: compositeId
        })
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

    clearQuote() {
      this.items = []
    }
  },

  persist: {
    storage: piniaPluginPersistedstate.localStorage()
  }
})
