# Imperial-Primary Size Labels Design

## Goal

Show footprint labels as imperial-first values with metres in brackets: `9ft × 7ft (2.15m × 2.70m)`.

## Display Rules

- Feet are rounded to whole numbers and ordered greatest to smallest.
- Metres are fixed to two decimal places and ordered smallest to greatest.
- Height follows the same unit priority: `Height: 8ft (2.40m)`.

## Architecture

Create one pure shared formatter for feet conversion and footprint labels. The catalogue UI, seed builder, and Sanity migration use it, preventing the frontend and stored `Size Label` field from drifting apart.

## Sanity Update

Add an idempotent catalogue script that reads every product size, replaces only each `sizes[].label` value, previews changes in `--dry-run`, then commits changed product documents in one Sanity transaction. The existing `lengthM` and `widthM` records remain untouched.

## Testing

Write formatter expectations first, covering unequal dimensions, equal dimensions, and height formatting. Update card/search contracts and seed output expectations. Run the targeted migration in dry-run mode before updating the configured Sanity dataset, then verify the catalogue.
