# Hide Maximum-Selection Message

## Goal

Keep choices disabled after a multiple-choice group reaches `maxSelections`, but do not show the customer-facing “Choose no more than {number} options” message.

## Design

The constraint evaluator remains responsible for disabled state and limit validation. For a choice disabled only because the group reached `maxSelections`, it sets `selectionDisabled` to `true` and leaves `selectionDisabledReason` undefined. Missing-requirement choices continue to include messages such as “Requires Standard Electrical Pack.” Existing maximum-selection violations retain their message for validation and diagnostics.

## Testing

Update the constraint evaluator test first. Assert that a choice disabled by `maxSelections` has no `selectionDisabledReason`, while its disabled state remains true. Existing tests continue to cover prerequisite messages and limit enforcement.
