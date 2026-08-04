# ADR-001: Client-Side Quote List Persistence with Pinia

## Context
Karmod International operates an enquiry-based sales workflow without a checkout or payment gateway. Visitors browse products, select variants/customizations, and accumulate items in a running quote list across page navigation before submitting a consolidated inquiry.

## Decision
We will manage the quote list using **Pinia** with `pinia-plugin-persistedstate` using `localStorage`.

### Key Specifications:
1. **Deduplication Strategy**: Items are identified by a composite key `${productId}-${variantLabel}-${notes || ''}`. If a visitor adds an existing item/variant combo, quantity is incremented rather than creating a duplicate row.
2. **Persistence**: Client-side `localStorage` stores the quote array across sessions and browser tabs.
3. **No Auth/Session Overhead**: Eliminates the need for user accounts, server-side sessions, or database storage prior to final quote submission.

## Consequences
- Fast, instant feedback when adding items.
- Works offline and requires zero backend server infrastructure until final submission.
- Storage is tied to the visitor's local browser context.
