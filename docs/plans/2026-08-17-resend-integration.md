# Implementation Plan: Resend Integration for Info Mails and Quote

**Feature**: Unified Resend email integration for contact/info inquiries and quote requests with branded HTML templates, simulation fallback, and Sanity lead syncing.
**Date**: 2026-08-17
**Status**: Ready for execution

---

## Tasks

### Task 1: Email Utility & Branded Template Generator
- **Files**:
  - `server/utils/email.ts` (NEW)
  - `tests/server/email.test.ts` (NEW)
- **Goal**: Centralized Resend client with HTML email rendering for both contact enquiries and quote requests.
- **Steps**:
  1. RED: Write failing unit test in `tests/server/email.test.ts` covering HTML generation and mock dispatch.
  2. Verify failure: `pnpm test tests/server/email.test.ts`
  3. GREEN: Implement `server/utils/email.ts` with `sendEmail`, `renderBrandedEmailTemplate`, `buildContactEmails`, `buildQuoteEmails`.
  4. Verify pass: `pnpm test tests/server/email.test.ts`

---

### Task 2: Contact / Info Mail API Endpoint
- **Files**:
  - `server/api/contact.post.ts` (NEW)
  - `tests/server/contact.test.ts` (NEW)
- **Goal**: Server endpoint validating contact form submissions and dispatching dual emails (sales notification + customer auto-reply).
- **Steps**:
  1. RED: Write test in `tests/server/contact.test.ts` testing validation (name, email, message) and mock email sending.
  2. Verify failure: `pnpm test tests/server/contact.test.ts`
  3. GREEN: Implement `server/api/contact.post.ts` using `readBody`, input sanitization, `sendEmail`, error handling.
  4. Verify pass: `pnpm test tests/server/contact.test.ts`

---

### Task 3: Refactor Quote API Endpoint
- **Files**:
  - `server/api/quote.post.ts` (MODIFY)
  - `tests/server/quote.test.ts` (NEW)
- **Goal**: Connect `/api/quote` to unified `email.ts` templates and `sanityLead.ts` lead creation helper.
- **Steps**:
  1. RED: Write test in `tests/server/quote.test.ts` verifying quote validation, pricing summary, and email formatting.
  2. Verify failure: `pnpm test tests/server/quote.test.ts`
  3. GREEN: Refactor `server/api/quote.post.ts` to use `buildQuoteEmails`, `sendEmail`, and optional Sanity lead sync.
  4. Verify pass: `pnpm test tests/server/quote.test.ts`

---

### Task 4: Connect ContactSection Form on Frontend
- **Files**:
  - `app/components/ContactSection.vue` (MODIFY)
- **Goal**: Wire up consultation form in `ContactSection.vue` to `$fetch('/api/contact')` with loading spinner, validation errors, and success state.
- **Steps**:
  1. Add reactive submission state, error alert banner, loading indicator to button.
  2. Submit to `/api/contact` on form submit.
  3. Clear form on success after brief delay.

---

### Task 5: Config, Environment & Full Verification
- **Files**:
  - `nuxt.config.ts` (MODIFY)
  - `.env.example` (MODIFY)
- **Goal**: Expose email config in `runtimeConfig` and run full vitest suite.
- **Steps**:
  1. Update `nuxt.config.ts` runtimeConfig with `resendApiKey`, `businessEmail`, `fromEmail`.
  2. Update `.env.example` with detailed Resend options.
  3. Run `pnpm test` and ensure all test suites pass.
