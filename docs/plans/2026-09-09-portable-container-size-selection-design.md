# Portable Container Size Selection Design

## Goal

Present each portable-container model once, let customers select a configured size while
customizing it, and retain independent container configurations in one quote.

## Options Considered

1. Duplicate shared imagery onto every size. Rejected: creates CMS data the ticket explicitly
   disallows.
2. Change every catalogue category to model-first selection. Rejected: alters established flows
   outside portable containers.
3. Gate model grouping, shared imagery, and deferred size choice to the `containers` category.
   Chosen: isolates the exception and preserves existing category behaviour.

## Catalogue and CMS

The catalogue query carries all configured size options for portable containers, including sizes
without images. A grouped card derives its available labels and its lowest numeric price; when no
numeric price exists it displays Price on application. Shared product imagery is marked
Representative image. Sanity permits a portable size to omit per-size imagery and floor plans,
but retains current validation for every other category.

## Customization Flow

The portable action creates a provisional quote line with no selected size. Customize renders an
accessible required selector. Selection replaces the line's size-derived dimensions, base price,
POA flag, and matching images/floor plan without changing quantity or customization state.
Unselected lines cannot progress or submit; server validation enforces the same condition.

## Quote Identity and Persistence

Container line identity is product, selected size, and canonicalized customization selections.
Matching identities merge quantities; different extras remain separate. Existing concrete-size
line identifiers continue to load. Re-keying after size or option changes merges only an identical
configuration and otherwise retains the independent line.

## Testing

Add focused tests first for grouping, starting-price/POA rules, portable CMS validation,
required selection, size switching, configuration identity/merging, persistence, server
rejection, and existing-category behaviour. Run targeted tests throughout, then typecheck and
the complete suite.
