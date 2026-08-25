# Delivery Charge Sales Review Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace automated delivery-distance/fee behavior with a required delivery destination and clear sales-review messaging throughout quote submission and acknowledgement.

**Architecture:** Keep Google Places autocomplete and manual address entry, but remove all distance-calculation consumers and infrastructure. Enforce destination presence at the quote API boundary. Rework quote emails as request acknowledgements showing product estimates excluding VAT while marking delivery/offload charges pending sales review.

**Tech Stack:** Nuxt 4, Vue 3, TypeScript, Nitro server handlers, Vitest, table-based HTML email templates.

---

### Task 1: Lock server behavior with failing tests

**Files:**
- Modify: `tests/server/quote.test.ts`
- Modify: `tests/server/email.test.ts`

**Step 1: Write failing quote API tests**

- Reject missing delivery destination.
- Accept a parsed address containing town/city and postcode.

**Step 2: Write failing email tests**

- Assert customer and business emails say delivery/offload charge is pending sales review.
- Assert product estimate is ex. VAT.
- Assert no `£450`, mileage, final total, VAT arithmetic, validity period, Accept Quote, or Download PDF appears.
- Assert customer email describes a received request, not a ready quote.

**Step 3: Run tests to verify RED**

Run: `pnpm test tests/server/email.test.ts tests/server/quote.test.ts`

Expected: failures caused by existing optional address validation and final-quote email behavior.

### Task 2: Implement API validation and acknowledgement emails

**Files:**
- Create: `shared/utils/deliveryAddress.ts`
- Create: `tests/utils/deliveryAddress.spec.ts`
- Modify: `server/api/quote.post.ts`
- Modify: `server/utils/email.ts`
- Modify: `scripts/generate-email-preview.mjs`

**Step 1: Require delivery destination server-side**

- Accept parsed addresses only when town/city and postcode exist.
- Reject unstructured strings because they cannot prove both required fields.
- Return a focused 400 response for missing destination.

**Step 2: Replace final-quote email cards**

- Remove `deliveryEstimate` from payload types.
- Keep customer/contact, destination, notes, item cards, and request reference.
- Label product amount `Product estimate (ex. VAT)`.
- Label `VAT`, `Delivery`, and `Offload` as pending formal sales quote/review.
- Keep internal reply-to-customer action.
- Customer guidance: sales team reviews destination and contacts customer; reply to email for questions.
- Remove validity, total, fee arithmetic, acceptance, and PDF actions.

**Step 3: Update preview fixture**

- Remove distance/delivery fee fixture data.
- Use `sizeLabel`.

**Step 4: Run focused tests to verify GREEN**

Run: `pnpm test tests/server/email.test.ts tests/server/quote.test.ts`

Expected: both test files pass.

### Task 3: Update quote-page experience

**Files:**
- Modify: `app/pages/quote.vue`

**Step 1: Require delivery address**

- Pass `required` to `UkAddressAutocomplete`.
- Remove distance imports, state, handlers, watchers, card, and payload.

**Step 2: Add transparent delivery-price notice**

- Place notice directly below destination input.
- Copy: `The sales team will contact you about the delivery charge after reviewing your quote request.`
- Clarify offload requirements/costs are also confirmed during review.
- Repeat compact notice beside submit action.

**Step 3: Correct success state**

- Confirm request submission only.
- State sales review/contact behavior.
- Remove guarantee that acknowledgement email was dispatched.

**Step 4: Run type/build check**

Run: `pnpm exec nuxi typecheck`

Expected: exit 0.

### Task 4: Remove unused distance infrastructure

**Files:**
- Delete: `app/components/DeliveryDistanceCard.vue`
- Delete: `app/composables/useDeliveryDistance.ts`
- Delete: `server/api/delivery/distance.get.ts`
- Delete: `server/api/delivery/distance.post.ts`
- Delete: `server/utils/distance.ts`
- Delete: `tests/server/distance.test.ts`
- Modify: `nuxt.config.ts`
- Modify: `.env.example`

**Step 1: Delete distance-only files**

- Preserve Google Places autocomplete and its public key.

**Step 2: Remove Mapbox runtime config and environment documentation**

- Remove private/public `mapboxAccessToken` entries.
- Remove `MAPBOX_ACCESS_TOKEN` sample variable.

**Step 3: Verify no stale references**

Run: `rg -n "deliveryEstimate|DeliveryDistanceCard|useDeliveryDistance|MAPBOX_ACCESS_TOKEN|mapboxAccessToken|/api/delivery/distance" app server tests scripts nuxt.config.ts .env.example`

Expected: no matches.

### Task 5: Refresh artifacts and verify full change

**Files:**
- Regenerate: `public/email-preview.html`
- Regenerate: `docs/email-preview.html`

**Step 1: Regenerate email previews**

Run: `pnpm generate:email-preview`

Expected: preview generator exits 0.

**Step 2: Run full tests**

Run: `pnpm test`

Expected: all tests pass.

**Step 3: Run production build**

Run: `pnpm build`

Expected: build exits 0.

**Step 4: Refresh project graphs**

Run: `graphify update . --force`

Expected: graph regenerated after deleted files and changed flows.

**Step 5: Review diff against agreed requirements**

- Preserve unrelated size/catalogue changes in overlapping files.
- Confirm no distance fee, hardcoded delivery cost, or broken quote actions remain.
