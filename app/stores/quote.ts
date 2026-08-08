import { defineStore } from "pinia";
import type { SpecSummaryItem } from "~/types/customization";

export interface QuoteItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  variantLabel: string;
  basePrice?: number;
  priceModifier?: number;
  quantity: number;
  notes?: string;
  image?: string;
  configState?: Record<string, any>;
  customTotal?: number;
  specSummary?: SpecSummaryItem[];
}

export interface QuoteCustomerInfo {
  name: string;
  email: string;
  phone: string;
  company?: string;
  notes?: string;
}

export const useQuoteStore = defineStore("quote", {
  state: () => ({
    items: [] as QuoteItem[],
    lastVisitedRoute: "/products" as string,
    maxVisitedStep: 1 as number,
  }),

  getters: {
    totalItemsCount: (state) =>
      state.items.reduce((sum, item) => sum + item.quantity, 0),
    totalQuotePrice: (state) =>
      state.items.reduce(
        (sum, item) =>
          sum + (item.customTotal ?? item.basePrice ?? 0) * item.quantity,
        0,
      ),
    isEmpty: (state) => state.items.length === 0,
    continueRoute: (state) => {
      if (
        state.lastVisitedRoute &&
        ["/products", "/customize", "/quote"].includes(state.lastVisitedRoute)
      ) {
        return state.lastVisitedRoute;
      }
      if (state.items.length > 0) {
        return "/customize";
      }
      return "/products";
    },
    continueStepNumber: (state) => {
      if (state.lastVisitedRoute === "/quote") return 3;
      if (state.lastVisitedRoute === "/customize") return 2;
      if (state.lastVisitedRoute === "/products") return 1;
      return state.items.length > 0 ? 2 : 1;
    },
    isStepUnlocked: (state) => (stepNumber: number) => {
      if (stepNumber === 1) return true;
      if (stepNumber === 2) return state.items.length > 0 || state.maxVisitedStep >= 2;
      if (stepNumber === 3) return state.items.length > 0 && state.maxVisitedStep >= 3;
      if (stepNumber === 4) return state.maxVisitedStep >= 4;
      return false;
    },
    getItemQuantity: (state) => (productId: string) => {
      const match = state.items.find((i) => i.productId === productId);
      return match ? match.quantity : 0;
    },
    getProductItem: (state) => (productId: string) => {
      return state.items.find((i) => i.productId === productId);
    },
  },

  actions: {
    addItem(newItem: Omit<QuoteItem, "id">) {
      const compositeId = `${newItem.productId}-${newItem.variantLabel || "base"}-${(newItem.notes || "").trim().toLowerCase()}`;

      const existing = this.items.find((i) => i.id === compositeId);
      if (existing) {
        existing.quantity += newItem.quantity;
      } else {
        this.items.push({
          ...newItem,
          id: compositeId,
          customTotal: newItem.customTotal ?? newItem.basePrice,
        });
      }
    },

    incrementProduct(item: Omit<QuoteItem, "id">) {
      this.addItem({ ...item, quantity: 1 });
    },

    decrementProduct(productId: string) {
      const existing = this.items.find((i) => i.productId === productId);
      if (existing) {
        if (existing.quantity > 1) {
          existing.quantity -= 1;
        } else {
          this.removeItem(existing.id);
        }
      }
    },

    removeItem(id: string) {
      this.items = this.items.filter((item) => item.id !== id);
    },

    updateQuantity(id: string, quantity: number) {
      if (quantity <= 0) {
        this.removeItem(id);
        return;
      }
      const item = this.items.find((i) => i.id === id);
      if (item) {
        item.quantity = quantity;
      }
    },

    updateItemConfig(
      id: string,
      configState: Record<string, any>,
      customTotal: number,
      specSummary?: SpecSummaryItem[],
    ) {
      const item = this.items.find((i) => i.id === id);
      if (item) {
        item.configState = configState;
        item.customTotal = customTotal;
        if (specSummary) {
          item.specSummary = specSummary;
        }
      }
    },

    seedDefaultItems() {
      if (this.items.length === 0) {
        this.items = [
          {
            id: "sec-std-gatehouse-default",
            productId: "sec-std-gatehouse",
            productName: "Karmod Standard Security Gatehouse 2.0m",
            productSlug: "standard-gatehouse",
            variantLabel: "Security Cabins",
            basePrice: 3100,
            customTotal: 3100,
            quantity: 1,
            image: "/images/product-service-cabin-135.png",
            specSummary: [
              { label: "DIMENSIONS", value: "2.00m x 2.00m" },
              { label: "WALL FINISH", value: "Standard White (RAL 9002)" },
              { label: "WINDOWS", value: "3 Glazed Panes" },
              { label: "ELECTRICS", value: "Integrated LED & Sockets" },
            ],
          },
        ];
        this.updateMaxVisitedStep(2);
      }
    },

    updateMaxVisitedStep(step: number) {
      if (step > this.maxVisitedStep) {
        this.maxVisitedStep = step;
      }
    },

    setLastVisitedRoute(route: string) {
      if (["/products", "/customize", "/quote"].includes(route)) {
        this.lastVisitedRoute = route;
        if (route === "/products") {
          this.updateMaxVisitedStep(1);
        } else if (route === "/customize") {
          this.updateMaxVisitedStep(2);
        } else if (route === "/quote") {
          this.updateMaxVisitedStep(3);
        }
      }
    },

    clearQuote() {
      this.items = [];
      this.lastVisitedRoute = "/products";
      this.maxVisitedStep = 1;
    },
  },

  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
  },
});
