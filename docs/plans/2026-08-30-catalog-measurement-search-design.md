# Catalog Measurement Search Design

## Goal

Extend catalog search so users can find size cards by length, width, height, weight, and their displayed metric or imperial equivalents.

## Behavior

- Length, width, and optional height match metric and imperial values.
- Weight matches kilograms.
- Compact and spaced unit forms match: `2.4m`, `2.4 m`, `7.9ft`, `7.9 ft`, `450kg`, `450 kg`.
- Field-qualified searches match: `height 2.4m`, `width 2m`, `weight 450kg`.
- Multiple measurement clauses can target one size: `length 3m width 2m`.
- Bare values match any measurement on a size card.
- Measurement matches preserve existing size-only behavior: only matching size cards appear.
- Missing height and weight values add no search terms.
- Price remains outside measurement search.
- Existing product, category, description, URL, debounce, and category-tree behavior remains unchanged.

## Architecture

Generate canonical measurement terms while `toSizeCards` projects each Sanity size option into a `SizeCard`. Store those terms in the existing `sizeSearchTerms` field beside the raw size label and key. Keep `filterCatalog` unchanged: its current size-specific token matching already produces the required card granularity.

Use the existing metric-to-imperial conversion helper so searchable imperial values equal displayed values. Include raw compact metric values alongside formatted values so both `2.4m` and `2.40m` queries work predictably.

## Testing

Extend the `toSizeCards` public-seam tests first. Cover:

- length and width in metric and imperial forms;
- optional height and weight;
- compact, spaced, and field-qualified variants;
- omission of unsupplied height/weight;
- measurement terms remaining isolated per size card.

Extend `filterCatalog` tests with real projected cards to prove measurement queries select only the matching size and allow combined field-qualified terms.
