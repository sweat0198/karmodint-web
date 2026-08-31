# WhatsApp Contact Update Design

## Goal

Route WhatsApp contact links to `+44 7359 538937` and display that number in the header action on desktop and mobile.

## Approach

Keep `COMPANY_CONTACT` as the single source of truth. Update its WhatsApp digits, formatted display value, and `wa.me` URL. Expose the display value through `useQuickContact`, then render it in both header WhatsApp actions.

## Behaviour

- WhatsApp links open `https://wa.me/447359538937` with the existing prefilled message.
- Header actions show `+44 7359 538937` beside the WhatsApp icon.
- Existing quote-count badge and responsive layouts remain unchanged.

## Verification

Add a constants regression test for phone formatting and WhatsApp URL. Run the focused test, full test suite, typecheck, and production build.
