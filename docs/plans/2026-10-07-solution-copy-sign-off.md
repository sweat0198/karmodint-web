# Solution copy: client sign-off

Issue [#32](https://github.com/sweat0198/karmodint-web/issues/32). The client answered each item on 2026-10-07. The retained Legacy copy matches those answers. All customer-facing changes are cuts; no replacement copy was written.

| Item | Client's answer | Change |
| --- | --- | --- |
| Welfare and WC Units: chemical, camping and flush toilets | "Remove the detailed toilets" | Removed the Camping, Chemical and Flush toilet product bullets from `welfare-and-wc-units.md`. Removed the five FAQs listed below because their answers assume chemical toilets or tanks requiring emptying. General toilet/shower cabin copy and three general FAQs remain. |
| Garden Rooms and Garden Offices: sheds, summer houses, sun houses, pods, DIY kits and planning-permission help | "Keep it" | No change. |
| Security Gatehouses and Car Park, Valet and Weighbridge Cabins: surveillance systems and ticket machines | "Keep" | No change. |
| Retail and Food Service Kiosks: eight cuts claiming rentals or used sales | "No renting or second hand" | Confirmed all eight existing cuts documented in `scripts/solutions/data.ts`. Removed three remaining sentences implying rental or used options, listed below. |

## Welfare and WC cuts

Removed these complete product bullets:

- Portable Camping Toilet for Sale
- Portable Chemical Toilet for Sale
- Portable Flush Toilets for Sale

Removed these complete FAQs from `welfare-and-wc-units.faqs.md`:

- How do you empty a portable toilet?
- Can I use a portable toilet in the house?
- What are the disadvantages of a portable toilet?
- How often do you need to empty a portable toilet?
- How do portable toilets work?

The remaining FAQs are "How much do portable toilets cost?", "What is a portable toilet?" and "How to use a portable toilet?".

## Retail kiosk cuts

The client confirmed these eight previous cuts:

1. The second sentence of "Extensive Options for Every Business".
2. "Every kiosk, from retail kiosk rental to purchase, …" in the Creativity section.
3. "Whether it's a retail kiosk for sale or rental retail kiosk options, …" in Variety and Customization.
4. "Each used retail kiosk for sale, … unfolding …".
5. The "Factors Influencing Cost" bullet about rental agreements.
6. The "Economical Alternatives" bullet about used kiosk sales.
7. The renting paragraph and "Financial Flexibility" / "Location Versatility" bullets in "Rent or Own?".
8. The "Quality Assurance" bullet about inspected used kiosks.

Three additional sentences were cut to match "No renting or second hand":

- `retail-and-food-service-kiosks.md`: the closing sentence starting "In this intricate dance of decisions, Karmod emerges …", which claims Karmod guides renting and used-kiosk choices. The other two sentences of that paragraph remain.
- `retail-and-food-service-kiosks.faqs.md`, "Is a kiosk a good business?": "Plus, the ability to buy or rent a retail kiosk based on the business model further enhances flexibility." The rest of the answer remains.
- `retail-and-food-service-kiosks.md`, "Ease of Expansion": "A brand could easily buy a retail kiosk in one location, rent another in a different city, and gradually build a widespread presence." The first sentence of the bullet remains.

General comparisons with renting and cautions about used units remain; they do not claim Karmod supplies either.

## Validation and patch

The existing public copy-builder tests check the retained FAQ count and questions, the absence of detailed toilet claims, and the absence of remaining kiosk rental/used-sales implications. No builder or patch behavior changed.

Run `npm run typecheck:solutions`, `npm test`, and `npm run solutions:patch-copy -- --dry-run`. Reapply the committed copy with `npm run solutions:patch-copy` to the configured Sanity dataset. The patch updates only `body` and `faqs` on the eight migrated Solutions, including any drafts.
