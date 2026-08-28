import { defineStore } from "pinia";
import type { CarouselImage, SanitySelectedCustomization } from "~/types/catalog";
import type {
  CustomizationNotes,
  CustomizationSelections,
  SpecSummaryItem,
} from "~/types/customization";

export interface QuoteItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  sizeKey: string;
  sizeLabel: string;
  basePrice?: number;
  priceModifier?: number;
  quantity: number;
  notes?: string;
  image?: string;
  /**
   * Every angle of this size, for the customize page's viewer. Optional: carts persisted before
   * this field existed replay with only `image`, and the viewer falls back to that single render.
   */
  images?: CarouselImage[];
  configState?: CustomizationSelections;
  customizationNotes?: CustomizationNotes;
  customTotal?: number;
  specSummary?: SpecSummaryItem[];
  selectedCustomizations?: SanitySelectedCustomization[];
  isPoa?: boolean;
}

export interface QuoteItemConfigPayload {
  selections: CustomizationSelections;
  notes: CustomizationNotes;
  total: number;
  isPoa: boolean;
  specSummary: SpecSummaryItem[];
  lines: SanitySelectedCustomization[];
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
    lastVisitedRoute: "/catalog" as string,
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
    hasPoa: (state) => state.items.some((item) => item.isPoa),
    isEmpty: (state) => state.items.length === 0,
    continueRoute: (state) => {
      if (
        state.lastVisitedRoute &&
        ["/catalog", "/customize", "/quote"].includes(state.lastVisitedRoute)
      ) {
        return state.lastVisitedRoute;
      }
      if (state.items.length > 0) {
        return "/customize";
      }
      return "/catalog";
    },
    continueStepNumber: (state) => {
      if (state.lastVisitedRoute === "/quote") return 3;
      if (state.lastVisitedRoute === "/customize") return 2;
      if (state.lastVisitedRoute === "/catalog") return 1;
      return state.items.length > 0 ? 2 : 1;
    },
    isStepUnlocked: (state) => (stepNumber: number) => {
      if (stepNumber === 1) return true;
      if (stepNumber === 2) return state.items.length > 0 || state.maxVisitedStep >= 2;
      if (stepNumber === 3) return state.items.length > 0 && state.maxVisitedStep >= 3;
      if (stepNumber === 4) return state.maxVisitedStep >= 4;
      return false;
    },
    getItemQuantity: (state) => (id: string) => {
      const match = state.items.find((i) => i.id === id);
      return match ? match.quantity : 0;
    },
    getProductItem: (state) => (id: string) => {
      return state.items.find((i) => i.id === id);
    },
  },

  actions: {
    addItem(newItem: Omit<QuoteItem, "id">) {
      // One Quote List line per Product + Size Option (D6). Re-adding increments the quantity.
      // TODO: when customers ask to order the same size twice with different customizations,
      // this id needs a configuration discriminator.
      const compositeId = `${newItem.productId}-${newItem.sizeKey}`;

      const existing = this.items.find((i) => i.id === compositeId);
      if (existing) {
        existing.quantity += newItem.quantity;
        // Renders are derived from the catalog, not from anything the customer chose, so re-adding
        // refreshes them. This is what backfills `images` onto a line persisted before that field
        // existed — without it such a line would never gain its extra angles.
        existing.image = newItem.image;
        existing.images = newItem.images;
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

    decrementItem(id: string) {
      const existing = this.items.find((i) => i.id === id);
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

    updateItemConfig(id: string, payload: QuoteItemConfigPayload) {
      const item = this.items.find((i) => i.id === id);
      if (item) {
        item.configState = payload.selections;
        item.customizationNotes = payload.notes;
        item.customTotal = payload.total;
        item.isPoa = payload.isPoa;
        item.specSummary = payload.specSummary;
        item.selectedCustomizations = payload.lines;
      }
    },

    updateMaxVisitedStep(step: number) {
      if (step > this.maxVisitedStep) {
        this.maxVisitedStep = step;
      }
    },

    setLastVisitedRoute(route: string) {
      if (["/catalog", "/customize", "/quote"].includes(route)) {
        this.lastVisitedRoute = route;
        if (route === "/catalog") {
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
      this.lastVisitedRoute = "/catalog";
      this.maxVisitedStep = 1;
    },
  },

  persist: {
    // Bumped from the unversioned default key so a cart persisted under the old shape (a
    // `variantLabel` instead of `sizeKey`/`sizeLabel`, plus the fixture `sec-guard-house` items
    // that match no Sanity Product) is dropped on load rather than surfacing dead items (D7).
    key: "quote-v2",
    storage: piniaPluginPersistedstate.localStorage(),
  },
});
