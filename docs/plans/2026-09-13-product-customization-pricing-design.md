# Product Customization Pricing Design

## Goal

Load the existing customization UI from Sanity Product data. Keep the existing
`customizationGroups` Product field as a migration fallback.

## Data model

A Product gets `customizationConfigurations`. Each configuration references one
reusable Customization Group. It can disable a group item and override its
pricing type or price. An absent configuration uses the legacy direct group
references. An absent override uses the Customization Item default.

Resolution order is Size Option override, Product override, then Customization
Item default. This change implements Product override and default only. It
does not add Size Option override fields.

## Product availability

- Portable Containers: Electricity, Heater, AC, WC, Kitchen.
- Other Products: Electricity, Heater, AC.
- Small cabins disable Electricity's `2 light, 4 double socket` item.
- AC, Heater, WC, and Kitchen are optional boolean groups.

## Behaviour

The existing Product Customizer components render resolved Sanity groups. They
do not render demo fixtures or a demo-data notice. The pricing resolver gives
fixed, included, and POA items one result shape. Quote lines retain a per-unit
customized price. Quote List totals multiply this price by quantity. Known
amounts use ex-VAT wording; POA never hides the known subtotal.

Seed prices remain `1` as temporary per-unit ex-VAT placeholder values. Studio
editors will replace them later.

## Tests

Cover default, Product override, included, POA, disabled-item fallback, and
quantity multiplication. Cover query projection and schema fields so future
schema edits cannot remove the configuration route.
