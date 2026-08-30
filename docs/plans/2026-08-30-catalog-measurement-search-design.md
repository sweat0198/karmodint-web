# Catalog Measurement Search Design

## Goal

Extend catalog search so users can find size cards using the measurement terms already rendered on catalog cards: footprint, Height, Weight, and their displayed metric or imperial equivalents.

## Behavior

- Rendered footprint values match metric and imperial forms.
- Rendered `Height` and `Weight` values match their labels and values.
- Compact and spaced unit forms match: `2.4m`, `2.4 m`, `7.9ft`, `7.9 ft`, `450kg`, `450 kg`.
- Field-qualified searches match rendered labels: `height 2.4m`, `weight 450kg`.
- Bare values match any displayed measurement on a size card.
- `length` and `width` stay unsupported because those labels do not appear on catalog cards.
- Measurement matches preserve existing size-only behavior: only matching size cards appear.
- Missing height and weight values add no search terms.
- Price remains outside measurement search.
- Existing product, category, description, URL, debounce, and category-tree behavior remains unchanged.

## Architecture

Generate search terms from the rendered `footprint` and `specs` values while `toSizeCards` projects each Sanity size option into a `SizeCard`. Store those terms in the existing `sizeSearchTerms` field beside the raw size label and key. Keep `filterCatalog` unchanged: its current size-specific token matching already produces the required card granularity.

Use the existing metric-to-imperial conversion helper so searchable imperial values equal displayed values. Index rendered strings plus compact and spaced variants, so `2.4m` and `2.40m` queries work predictably without adding non-rendered terminology.

## Testing

Extend the `toSizeCards` public-seam tests first. Cover:

- rendered footprint in metric and imperial forms;
- optional rendered Height and Weight specs;
- compact, spaced, and field-qualified variants;
- omission of unsupplied height/weight;
- measurement terms remaining isolated per size card.

Extend `filterCatalog` tests with real projected cards to prove displayed measurement queries select only the matching size, preserve `height`/`weight` qualification, and reject non-rendered `length`/`width` aliases.
