# Production Go-Live Checklist: Resend Email Configuration

Checklist for activating live email delivery when launching into production.

---

## 1. Resend Account & Domain Verification
- [ ] Log in to [resend.com](https://resend.com).
- [ ] Add domain (`karmodint.co.uk` or subdomain `mail.karmodint.co.uk`).
- [ ] Add DNS verification records provided by Resend to DNS provider (Cloudflare / domain registrar):
  - [ ] **DKIM** (TXT / CNAME)
  - [ ] **SPF** (TXT)
  - [ ] *Do NOT overwrite or delete existing MX records if your main inbox is hosted with Google Workspace / Microsoft 365 / cPanel.*
- [ ] Verify domain in Resend dashboard until status shows **Verified**.

---

## 2. API Key Generation
- [ ] In Resend dashboard → **API Keys** → **Create API Key** (e.g. name: `karmodint-production`).
- [ ] Copy the secret key (`re_...`).

---

## 3. Cloudflare Pages / Production Environment Variables
- [ ] Go to **Cloudflare Dashboard** → **Workers & Pages** → `karmodint-web` → **Settings** → **Variables and Secrets**.
- [ ] Add the following environment variables:
  - `RESEND_API_KEY`: `"re_..."` (Encrypted / Secret)
  - `BUSINESS_EMAIL`: `"info@karmodint.co.uk"`
  - `RESEND_FROM_EMAIL`: `"Karmod International <info@karmodint.co.uk>"` (or verified subdomain sender e.g. `Karmod International <noreply@mail.karmodint.co.uk>`)
  - `SANITY_API_TOKEN`: `"<write_token>"` (Optional: to sync leads directly to Sanity Studio)

---

## 4. Production Smoke Testing
- [ ] Trigger a deployment on Cloudflare Pages.
- [ ] Visit `/contact` on production domain:
  - [ ] Submit a test consultation request.
  - [ ] Confirm email received at `info@karmodint.co.uk`.
  - [ ] Confirm auto-reply confirmation received at customer test email.
- [ ] Visit `/quote` on production domain:
  - [ ] Configure a unit and submit a quote request.
  - [ ] Confirm itemized quotation email received at `info@karmodint.co.uk`.
  - [ ] Confirm quote confirmation email received at customer test email.
- [ ] Check Resend dashboard **Logs** tab to verify 100% delivery rate and zero bounces.
