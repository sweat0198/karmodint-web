# ADR-001: Client-Side Quote List Persistence with Pinia

## Context
Karmod International operates an enquiry-based sales workflow without a checkout or payment gateway. Visitors browse products, select variants/customizations, and accumulate items in a running quote list across page navigation before submitting a consolidated inquiry.

## Decision
We will manage the quote list using **Pinia** with `pinia-plugin-persistedstate` using `localStorage`.

### Key Specifications:
1. **Deduplication Strategy**: Items are identified by Product, Size Option, selected Customization Items, and customer notes (D6) — `${productId}-${sizeKey}` for an unconfigured line, or that plus a hash of the selections and notes once the customer has configured it. If a visitor adds or configures a line that now matches one already in the Quote List, quantity merges into the existing line; a different configuration of the same Product and Size Option stays a separate line.
2. **Persistence**: Client-side `localStorage` stores the quote array across sessions and browser tabs.
3. **No Auth/Session Overhead**: Eliminates the need for user accounts, server-side sessions, or database storage prior to final quote submission.

## Consequences
- Fast, instant feedback when adding items.
- Works offline and requires zero backend server infrastructure until final submission.
- Storage is tied to the visitor's local browser context.
- A Size Option change reprices and re-validates a line's customization selections through the shared resolver (see the size-option customization matrix ADR/plan), rather than adjusting the stored total by a base-price delta — this is what lets the configuration discriminator above stay accurate after the change.

## Resolved: configuration discriminator
The original open question — a dedup key with no configuration discriminator, so a second unit of the same size customized differently would silently merge into the first — is resolved: `getQuoteLineId` (`shared/utils/quoteLine.ts`) folds the canonicalized selections and notes into the id for every line, not only portable-container ones, and the store re-keys a line whenever its configuration changes, merging it into a matching line or keeping it separate as appropriate.
