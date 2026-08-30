# Catalog Measurement Tokenization Design

## Goal

Prevent decimal measurement queries from matching unrelated numbers while preserving tolerant product and category text search.

## Decision

Keep case folding, Turkish-character folding, accent folding, and punctuation normalization for text. Parse numeric search tokens separately from text tokens.

- Treat comma decimals as dot decimals: `1,5` becomes `1.5`.
- Preserve decimal values while normalizing text.
- Compare numeric values, not digit substrings: `1.5` matches displayed `1.50m`, but not `2.15m` or `11.5m`.
- When the query includes a unit, require the same normalized unit: `1.5m` does not match `1.5ft`.
- Retain current token-AND behavior for ordinary text such as product and category names.

## Alternatives considered

1. Preserve decimal punctuation, then keep substring matching. Smaller change, but `1.5` still matches `11.5m`.
2. Recommended: parse numeric tokens and compare their numeric value plus optional unit. Exact measurement intent; tolerant formatted values.
3. Disable normalization globally. Avoids this false positive but regresses Turkish/accent/punctuation search for product and category text.

## Architecture

`catalogSearch.ts` will retain one normalizer for common text folding, updated to preserve decimal separators and canonicalize comma decimals. `includesEveryToken` will delegate each token to a matcher:

- textual tokens use current normalized substring behavior;
- numeric tokens use a measurement parser against normalized whitespace-separated terms.

`filterCatalog` remains the public API and still searches product metadata and per-card `sizeSearchTerms`. `sizeCards.ts` and the visible search-field placeholder remain unchanged.

## Tests

Add public `filterCatalog` tests with projected cards. Prove:

- `1.5` matches the card rendered as `1.50m`;
- `1,5` behaves identically;
- `1.5` does not match a `2.15m` card or an `11.5m` card;
- `1.5m` requires meters and `1.5ft` requires feet;
- existing Turkish/punctuation product search remains unchanged.
