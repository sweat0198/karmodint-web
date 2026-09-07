# ADR-001: Client-Side Quote List Persistence with Pinia

## Context
Karmod International operates an enquiry-based sales workflow without a checkout or payment gateway. Visitors browse products, select variants/customizations, and accumulate items in a running quote list across page navigation before submitting a consolidated inquiry.

## Decision
We will manage the quote list using **Pinia** with `pinia-plugin-persistedstate` using `localStorage`.

### Key Specifications:
1. **Deduplication Strategy**: Items are identified by a composite key `${productId}-${sizeKey}` — one line per Product + Size Option (D6). If a visitor adds a size already in the Quote List, quantity is incremented into the existing line rather than creating a duplicate row.
2. **Persistence**: Client-side `localStorage` stores the quote array across sessions and browser tabs.
3. **No Auth/Session Overhead**: Eliminates the need for user accounts, server-side sessions, or database storage prior to final quote submission.

## Consequences
- Fast, instant feedback when adding items.
- Works offline and requires zero backend server infrastructure until final submission.
- Storage is tied to the visitor's local browser context.

## Open question
The dedup key has no configuration discriminator. If a visitor customizes a size, then goes back and adds the same size again wanting a second unit configured differently, today's key merges the second add into the first line rather than starting a second, distinctly-configured line. Nobody has asked for this yet; if they do, the key will need a configuration discriminator (or an explicit "add as a new line" action).
