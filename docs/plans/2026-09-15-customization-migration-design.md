# Customization Migration Design

## Goal

Contract every Product onto Product Customization Configurations without changing customer-facing group assignment, item availability, or fixed, included, and POA prices.

## Migration

A dedicated catalogue script reads Products with legacy `customizationGroups`. It writes one configuration per reference, preserves reference order, and removes the legacy field in the same transaction. Group items remain the pricing authority, so no redundant price override is created for existing defaults.

The script first validates every legacy reference and every referenced item key. It produces an explicit review report for products that cannot form valid configurations, makes no writes when any report item exists, and refuses Products that already have configurations. Re-running after successful conversion is therefore safe: no legacy Products remain and no configuration is duplicated.

## Contracted runtime and schema

Remove the Product `customizationGroups` field, catalog query projection, client type, resolver fallback, and customizer branch. Configurations become required for Products that offer customizations; the resolver always operates on configurations and a selected Size Option. Product validation rejects orphaned Size Option rules and Customization Item rules for published Products.

Remove demo-only customizer notice/UI paths. The live product configuration remains the sole customer data source.

## Verification

Test migration planning, duplicate/mixed-state refusal, price-state preservation, validation reporting, and no legacy resolver fallback. Run schema, resolver, component, quote-store, quote API, typecheck, application tests, and both production builds. Execute the migration against Sanity only after the dry-run report is clean; retain its generated report as migration evidence.
