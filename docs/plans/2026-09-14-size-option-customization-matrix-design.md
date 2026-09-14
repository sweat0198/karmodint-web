# Size Option Customization Matrix Design

## Goal

Extend product customization configuration so availability, price, resolved equipment, and review state can be controlled per stable Size Option key and Customization Item key.

## Chosen approach

Use native Sanity object and array fields. A Product configuration retains its group-level item overrides. Each override can hold size rules keyed by `sizeOptionKey`; this gives editors a nested native editor without a custom Studio input component.

## Resolution

For a selected Product, Size Option, and item, resolve the first applicable layer:

1. Matching Size Option rule.
2. Product-level item override.
3. Customization Item defaults.

Size rules support inherit, fixed, included, POA, and unavailable. Rules can override title and description, so equipment can differ by Product and Size Option.

## Availability and validation

Items declare `universal` or `sizeDependent` scope. Universal items inherit when no size rule exists. Size-dependent items require a reviewed rule for every Product Size Option. Product configuration validation keeps drafts editable and prevents publishing when rules are incomplete, stale, orphaned, or leave a mandatory group without available items.

Rules use Sanity array `_key` values only. Rename and reorder therefore preserve links. Deleted item or size keys remain in the stored rules and surface as validation errors, not silent data loss.

## Initial catalogue policy

- WC and Kitchen: configure only on container Products.
- Heater, AC, and Electricity: configure on all applicable Products.
- Electricity's two-light/four-double-socket item: mark unavailable for each small-cabin Size Option key.
