import { defineStore } from "pinia";
import type { SanitySelectedCustomization } from "~/types/catalog";
import type { CustomizationNotes, CustomizationSelections, SpecSummaryItem } from "~/types/customization";
import type { QuoteLine } from "~~/shared/utils/quoteLine";
import { getQuoteLinesTotal } from "~~/shared/utils/quoteLine";
import type { SizeCard } from "~/utils/sizeCards";
import type { PortableContainerCard, PortableContainerSize } from "~/utils/portableContainerCards";
import { sanityImageUrl } from "~/utils/sanityImageUrl";
import { toCarouselImages } from "~/utils/carouselImages";
import { resolveSanityImageConfig } from "~/utils/sanityImageConfig";
import { getQuoteLineId } from "~~/shared/utils/quoteLine";

export type QuoteItem = QuoteLine;

/** Wider than the card's frames — the customize page shows these in a large primary viewer. */
const CUSTOMIZE_VIEWER_IMAGE_WIDTH = 1200;

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
    portableSelectionSequence: 0,
    lastVisitedRoute: "/products" as string,
    maxVisitedStep: 1 as number,
  }),

  getters: {
    totalItemsCount: (state) =>
      state.items.reduce((sum, item) => sum + item.quantity, 0),
    totalQuotePrice: (state) => getQuoteLinesTotal(state.items),
    hasPoa: (state) => state.items.some((item) => item.isPoa),
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
    getItemQuantity: (state) => (id: string) => {
      const match = state.items.find((i) => i.id === id);
      return match ? match.quantity : 0;
    },
    getProductItem: (state) => (id: string) => {
      return state.items.find((i) => i.id === id);
    },
  },

  actions: {
    /**
     * The Quote List's intake: callers pass the Size Option card a visitor picked, and this
     * derives the line — identity, labels, add-time price, the POA flag, and renders at both the
     * thumbnail width and the larger width the customize page's viewer wants. Callers no longer
     * resolve any image URL themselves.
     */
    addSizeOption(card: SizeCard, quantity = 1) {
      const { projectId, dataset } = resolveSanityImageConfig();
      this.addItem({
        productId: card.productId,
        productName: card.productName,
        productSlug: card.productSlug,
        sizeKey: card.sizeKey,
        sizeLabel: card.sizeLabel,
        basePrice: card.price,
        isPoa: card.isPoa,
        quantity,
        image: sanityImageUrl(card.thumbnail.asset?._ref, projectId, dataset),
        images: toCarouselImages(card.images, projectId, dataset, CUSTOMIZE_VIEWER_IMAGE_WIDTH),
      });
    },

    /** Add a portable model for configuration; its size is intentionally unresolved at this point. */
    addPortableContainer(card: PortableContainerCard) {
      const { projectId, dataset } = resolveSanityImageConfig();
      const image = sanityImageUrl(card.representativeImage?.asset?._ref, projectId, dataset);
      this.portableSelectionSequence += 1;
      this.items.push({
        id: `${card.productId}-selection-${this.portableSelectionSequence}`,
        productId: card.productId,
        productName: card.productName,
        productSlug: card.productSlug,
        sizeKey: "",
        sizeLabel: "Choose a size",
        quantity: 1,
        image,
        images: image ? [{ src: image, alt: card.representativeImage?.alt ?? `${card.productName} representative image` }] : [],
        isPoa: card.isPoaOnly,
        isPortableContainer: true,
        hasSelectedSize: false,
      });
    },

    /**
     * Select or replace a portable line's size while retaining its extras, quantity, and the
     * configured total's option-price delta.
     */
    selectPortableSize(id: string, size: PortableContainerSize): string | undefined {
      const item = this.items.find((candidate) => candidate.id === id);
      if (!item || !item.isPortableContainer) return undefined;

      const { projectId, dataset } = resolveSanityImageConfig();
      const thumbnail = size.images[0];
      const previousBasePrice = item.basePrice ?? 0;
      item.sizeKey = size.sizeKey;
      item.sizeLabel = size.sizeLabel;
      item.basePrice = size.price;
      item.isPoa = size.isPoa;
      item.hasSelectedSize = true;
      item.image = sanityImageUrl(thumbnail?.asset?._ref, projectId, dataset);
      item.images = toCarouselImages(size.images, projectId, dataset, CUSTOMIZE_VIEWER_IMAGE_WIDTH);
      const planSrc = sanityImageUrl(size.planImage?.asset?._ref, projectId, dataset, {
        width: CUSTOMIZE_VIEWER_IMAGE_WIDTH,
        fit: "max",
      });
      item.floorPlan = planSrc
        ? { src: planSrc, alt: size.planImage?.alt ?? `${item.productName} ${size.sizeLabel} floor plan` }
        : undefined;
      // Preserve configured option pricing while replacing only the size-derived base amount.
      // This also keeps POA size changes honest: an absent base is not invented as a numeric price.
      if (item.customTotal !== undefined) {
        item.customTotal += (size.price ?? 0) - previousBasePrice;
      }

      return this.rekeyPortableItem(item);
    },

    addItem(newItem: Omit<QuoteItem, "id">) {
      // One Quote List line per Product + Size Option (D6). Re-adding increments the quantity.
      // TODO: when customers ask to order the same size twice with different customizations,
      // this id needs a configuration discriminator (see ADR-001's open question).
      const compositeId = getQuoteLineId(newItem);

      const existing = this.items.find((i) => i.id === compositeId);
      if (existing) {
        existing.quantity += newItem.quantity;
        // Renders are derived from the catalog, not from anything the customer chose, so re-adding
        // refreshes them. This is what backfills `images` onto a line persisted before that field
        // existed — without it such a line would never gain its extra angles.
        existing.image = newItem.image;
        existing.images = newItem.images;
        // Only overwrite notes when the incoming add actually carries one — an increment/re-add
        // that doesn't mention notes must not wipe out ones already on the line.
        existing.notes = newItem.notes ?? existing.notes;
      } else {
        this.items.push({
          ...newItem,
          id: compositeId,
          customTotal: newItem.customTotal ?? newItem.basePrice,
        });
      }
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
        return item.isPortableContainer ? this.rekeyPortableItem(item) : item.id;
      }
      return undefined;
    },

    /** Re-key an already-selected portable line and merge only an identical configuration. */
    rekeyPortableItem(item: QuoteItem): string {
      const nextId = getQuoteLineId(item);
      if (item.id === nextId) return item.id;

      const matching = this.items.find((candidate) => candidate.id === nextId);
      if (matching) {
        matching.quantity += item.quantity;
        this.items = this.items.filter((candidate) => candidate !== item);
        return matching.id;
      }

      item.id = nextId;
      return item.id;
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
      this.portableSelectionSequence = 0;
      this.lastVisitedRoute = "/products";
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
