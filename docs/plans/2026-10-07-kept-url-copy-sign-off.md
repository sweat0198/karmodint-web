# Kept URL copy: client sign-off

Issue #31. Some Legacy copy on the Kept URLs (see `docs/plans/2026-10-06-uk-migration-design.md`) was ported word for word but might no longer be true. The client answered each item on 2026-10-07. The ported copy now matches those answers. Every change is a cut. No new wording was written.

| Item | Client's answer | Change |
| --- | --- | --- |
| Home: "Established in 1986" and "135 countries" (the About page says "more than 100 countries") | Remove them | `HomeCompanySection.vue`: dropped "Established in 1986, " from the introduction, and ", serving clients across 135 countries" from "Global Reach:". |
| `/modular-buildings/` FAQ "Who builds the best portable buildings?" names competitors | Drop the FAQ for now | FAQ removed from `modular-buildings.faqs.md`. Its text is kept below. |
| `/modular-buildings/` sentence ending mid-word ("economic efficienc") | Cut it | That sentence was removed. The first sentence of its paragraph stays. |
| `/portable-cabin/portable-classroom/` talks about hiring and buying used classrooms. Karmod sells new units only | Cut it | Removed every sentence about hire, renting or used units, the section "Buyer's Beware: Navigating Disadvantages of Used Portable Classrooms", and the FAQ "Which is more advantageous for a mobile classroom, buying or renting?" |
| `/portable-cabin/portable-house/` FAQs quote general UK house prices in £ | Remove them | Removed the four price FAQs: flat pack house, 4 bed house, modular homes, small house. |
| `/portable-cabin/` breadcrumb reads "Portable Cabin" | Keep "Portable Cabin" | No change. |

## Dropped FAQ, held for later

This FAQ comes from `/modular-buildings/`. It is out until the client decides how to answer it without naming competitors. To bring it back, add it to `sanity/product-lines/copy/modular-buildings.faqs.md` before "What is another name for a portable building?", then update the FAQ count in `tests/product-lines/buildDocuments.spec.ts`.

> **Who builds the best portable buildings?**
>
> The best portable building manufacturers vary by region, but leading companies are known for quality materials, durability, and customization options, such as Portakabin, Mobile Mini, and WillScot.
