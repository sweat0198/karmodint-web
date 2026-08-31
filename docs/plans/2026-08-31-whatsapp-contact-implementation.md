# WhatsApp Contact Update Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Route WhatsApp contact actions to `+44 7359 538937` and show that number in the header.

**Architecture:** `COMPANY_CONTACT` remains the shared contact authority. `useQuickContact` supplies the formatted WhatsApp number to `AppHeader`, which renders it in desktop and mobile WhatsApp actions.

**Tech Stack:** Nuxt 4, Vue 3, TypeScript, Vitest.

---

### Task 1: Cover WhatsApp contact metadata

**Files:**
- Create: `tests/constants/whatsapp-contact.test.ts`
- Modify: `app/constants/company.ts:63-65`

**Step 1: Write failing test**

```ts
it('uses the current WhatsApp contact details', () => {
  expect(COMPANY_CONTACT.whatsAppNumber).toBe('447359538937')
  expect(COMPANY_CONTACT.whatsAppDisplay).toBe('+44 7359 538937')
  expect(COMPANY_CONTACT.whatsAppUrl).toBe('https://wa.me/447359538937')
})
```

**Step 2: Run test to verify failure**

Run: `pnpm test tests/constants/whatsapp-contact.test.ts`

Expected: FAIL because existing WhatsApp details point at the previous number.

**Step 3: Write minimal implementation**

Set the three WhatsApp fields in `COMPANY_CONTACT` to the number, formatted display string, and `wa.me` URL above.

**Step 4: Run test to verify pass**

Run: `pnpm test tests/constants/whatsapp-contact.test.ts`

Expected: PASS.

### Task 2: Render WhatsApp number in header actions

**Files:**
- Modify: `app/composables/useQuickContact.ts:5-8,55-61`
- Modify: `app/components/AppHeader.vue:108,202`

**Step 1: Write failing test**

The shared contact regression test already asserts the formatted display string; the header will consume that tested value.

**Step 2: Run test to verify failure**

Run: `pnpm test tests/constants/whatsapp-contact.test.ts`

Expected: FAIL until the contact metadata is changed.

**Step 3: Write minimal implementation**

Export and return `COMPANY_CONTACT.whatsAppDisplay` from `useQuickContact`. Destructure it in `AppHeader` and replace both `WhatsApp` labels with the formatted number.

**Step 4: Verify**

Run:

```bash
pnpm test tests/constants/whatsapp-contact.test.ts
pnpm test
pnpm exec nuxi typecheck
pnpm build
```

Expected: all commands exit 0.

**Step 5: Commit**

```bash
git add app/constants/company.ts app/composables/useQuickContact.ts app/components/AppHeader.vue tests/constants/whatsapp-contact.test.ts docs/plans/2026-08-31-whatsapp-contact-implementation.md
git commit -m "fix: update whatsapp contact number"
```
