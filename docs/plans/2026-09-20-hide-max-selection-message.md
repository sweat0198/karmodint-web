# Hide Maximum-Selection Message Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Keep maximum-selection disabling and validation while hiding its customer-facing helper message.

**Architecture:** `evaluateCustomizationConstraints` continues to calculate `disabledByLimit` and maximum-selection violations. It attaches `selectionDisabledReason` only for missing prerequisites, so existing group components show requirement messages but render no limit helper.

**Tech Stack:** TypeScript, Vue 3, Vitest

---

### Task 1: Separate disabled state from visible reason

**Files:**
- Modify: `tests/utils/customizationConstraints.test.ts:91`
- Modify: `app/utils/customizationConstraints.ts:72`

**Step 1: Write the failing test**

Change the existing limit test to require disabled state without a visible reason:

```ts
const item = result.groups[0].items.find((candidate) => candidate._key === 'custom-electricity')

expect(item).toMatchObject({ selectionDisabled: true })
expect(item).not.toHaveProperty('selectionDisabledReason')
```

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- tests/utils/customizationConstraints.test.ts
```

Expected: FAIL because the evaluated item still contains `selectionDisabledReason` with the maximum-selection message.

**Step 3: Write minimal implementation**

In `evaluateCustomizationConstraints`, calculate the prerequisite message separately:

```ts
const missingRequirementMessage = missingRequirement
  ? requirementMessage(groupsById, missingRequirement.groupId, missingRequirement.itemKey)
  : undefined
```

Return:

```ts
return {
  ...item,
  selectionDisabled: Boolean(missingRequirement || disabledByLimit),
  ...(missingRequirementMessage
    ? { selectionDisabledReason: missingRequirementMessage }
    : {}),
}
```

Use `missingRequirementMessage` for the existing `missingRequirement` violation. Keep `limitMessage` for maximum-selection violations.

**Step 4: Run focused test**

Run:

```bash
npm test -- tests/utils/customizationConstraints.test.ts
```

Expected: PASS.

**Step 5: Run related component tests and type checking**

Run:

```bash
npm test -- tests/components/customizationGroups.spec.ts tests/utils/customizationConstraints.test.ts
npm run typecheck:customizations
```

Expected: PASS.

**Step 6: Refresh knowledge graphs**

Run:

```bash
graphify update .
code-review-graph update
```

Expected: both graphs update successfully.

**Step 7: Commit**

```bash
git add app/utils/customizationConstraints.ts tests/utils/customizationConstraints.test.ts docs/plans/2026-09-20-hide-max-selection-message.md
git commit -m "fix: hide maximum selection message"
```
