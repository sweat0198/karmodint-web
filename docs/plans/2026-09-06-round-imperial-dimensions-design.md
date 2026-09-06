# Round Imperial Dimensions Design

## Goal

Display meter-to-feet conversions as nearest whole feet so values such as `4.9ft` and `7.9ft` become `5ft` and `8ft`.

## Design

Change the shared `metersToFeet` helper to round the converted value with `Math.round`. Keep `formatMetricAndImperialDimension` unchanged so every existing consumer receives the same integer result and formatting remains centralized.

## Data Flow

Meter value enters `metersToFeet`, is multiplied by `METERS_TO_FEET`, and is rounded to the nearest integer. UI formatters and search-term generation consume that integer.

## Testing

Update the existing conversion contract tests first. Verify direct conversion and formatted output fail under tenth-precision behavior, then implement the one-line rounding change and run focused tests, type checking, and the full suite.
