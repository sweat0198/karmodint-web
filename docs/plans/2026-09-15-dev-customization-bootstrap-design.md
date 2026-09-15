# Dev customization bootstrap

## Goal

Keep the Sanity `dev` dataset ready for local Studio and deployment checks without changing
editor-owned Product customization choices.

## Scope

- Seed the five existing group definitions from `sanity/seeds/customizationGroups.ndjson`.
- Attach missing configurations from the repository's existing Product intent:
  - Electricity, Heater, and Air Conditioning for catalogued cabins.
  - Electricity, Heater, Air Conditioning, WC, and Kitchen for manual container products.
- Preserve existing groups, Product configurations, item overrides, and unrelated Product fields.
- Reject every dataset except `dev`.
- Expose dry-run by default and an explicit `--apply` write mode.
- Verify group and Product links after a successful write.

## Data flow

`customizations:sync-dev -- --apply` reads the configured Sanity target, checks that the dataset
is `dev`, reads current group/Product records, computes an additive plan, then commits each
missing group or Product configuration. A subsequent read verifies the expected records exist.

The pre-deployment command composes the bootstrap, legacy migration, and verification. It must
never run against production, even when the caller supplies production credentials.

## Safety

- Existing document IDs make group creation idempotent.
- Product updates append only configurations absent by group reference.
- Re-running a clean dataset produces zero planned writes.
- `--apply` is mandatory for mutation.
- Price values remain the existing seed placeholders (£1); pricing policy remains separate from
  deployment automation.

## Verification

- Unit tests cover dataset refusal, additive planning, idempotence, and preserved overrides.
- A focused command validates the stored dev group IDs and Product links.
- Typecheck and test suite remain green.
