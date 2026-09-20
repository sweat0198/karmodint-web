# Customization Selection Dependencies Design

## Goal

Apply the owner-supplied extra-item prices by Product Size Option. Keep dependent options visible but disabled until Standard Electrical Pack is selected. Removing the pack clears dependent selections and notes.

## Content model

`customizationGroup` gains optional `maxSelections`, used only by `multiple` groups. `customizationItem` gains `selectionRequirements`, an array of stable `{ group reference, itemKey }` targets. Both additions are optional, preserving existing documents.

Electricity becomes a multiple-choice group with `maxSelections: 2`:

- Standard Electrical Pack
- Blue Male Socket, requiring Standard Electrical Pack
- Customised Electricity, requiring Standard Electrical Pack

The two dependent Electricity choices cannot coexist because Standard consumes one of two allowed selections. Air Conditioning and Heater remain separate boolean groups; each item requires Standard Electrical Pack.

## Resolution seam

Static Product/Size pricing remains in `resolveCustomizationGroups`. A new pure constraint module evaluates resolved groups plus current selections. It returns transient disabled metadata and violations. A companion reconciliation function repeatedly removes invalid selections, trims groups above `maxSelections`, removes orphaned notes, and reports removed titles.

Client selection changes reconcile before persistence and pricing. Server quote revalidation evaluates the same constraints and rejects tampered dependent selections as unavailable.

## Price matrix

Workbook values map to Size Option rules:

- number: fixed additional price
- `INCLUDED`: included pricing at £0
- `X`: unavailable
- blank: group not offered for that Product family

Blue Male Socket is fixed at £75. Customised Electricity remains POA. Standard Electrical Pack, Air Conditioning, Heater, Kitchen, and WC use reviewed Size Option rules generated from the checked-in matrix. The Portable Cabin 3.00 × 7.00m kitchen value remains £1,474 exactly as supplied.

## Validation

Sanity prevents invalid limits, missing requirement targets, self-dependencies, dependency cycles, and requirements on groups absent from a published Product. Runtime constraints still defend persisted legacy data and submitted quote payloads.

## UI

Disabled choices remain visible. Controls use native `disabled`, muted styling, and a reason such as “Requires Standard Electrical Pack.” Removing Standard Electrical Pack shows a concise notice naming cleared selections.

## Test seams

- Sanity schema and publish validation
- Pure constraint evaluator and reconciler
- Product seed price matrix
- Customization controls
- Server quote revalidation
