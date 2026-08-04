# ADR-002: Static Site Generation (SSG) with Sanity CMS & Deploy Webhooks

## Context
Karmod International requires high-performance, SEO-optimized product pages without complex server infrastructure. Product catalog updates (prices, images, specifications) are managed by business owners via Sanity CMS.

## Decision
We use **Nuxt 4 Static Site Generation (`nuxi generate`)** coupled with Cloudflare Workers/Pages for static asset hosting.

### Key Specifications:
1. **Build-Time Data Fetching**: Product catalog data is fetched directly from Sanity via `@sanity/client` during `nuxi generate`. No per-request runtime API calls or SSR server instances are needed.
2. **Automated Rebuilds**: A Sanity Studio content publication webhook calls a Cloudflare Deploy Hook to automatically trigger site re-generation upon content changes.
3. **Single Serverless Function**: The only runtime endpoint on the site is `/api/quote.post.ts` for handling enquiry form emails via Resend.

## Consequences
- Ultra-fast page loads and top-tier Core Web Vitals performance.
- Minimal hosting cost and maximum security (static HTML output).
- Brief deployment latency (1-2 mins) when business updates content in Sanity.
