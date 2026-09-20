import type { SanityCustomizationGroup } from '~/types/catalog'
import type { CustomizationNotes, CustomizationSelections } from '~/types/customization'

export interface CustomizationConstraintViolation {
  groupId: string
  itemKey: string
  itemTitle: string
  message: string
  reason: 'missingRequirement' | 'maxSelections' | 'duplicateSelection'
}

export interface CustomizationConstraintEvaluation {
  groups: SanityCustomizationGroup[]
  violations: CustomizationConstraintViolation[]
}

function selectedItemKeys(
  group: SanityCustomizationGroup,
  selections: CustomizationSelections,
): string[] {
  const value = selections[group._id]
  if (group.selectionType === 'multiple') return Array.isArray(value) ? value : []
  if (group.selectionType === 'single') return typeof value === 'string' ? [value] : []
  return value === true && group.items[0]?._key ? [group.items[0]._key] : []
}

function isSelected(
  group: SanityCustomizationGroup,
  itemKey: string,
  selections: CustomizationSelections,
): boolean {
  return selectedItemKeys(group, selections).includes(itemKey)
}

function requirementMessage(
  groupsById: Map<string, SanityCustomizationGroup>,
  groupId: string,
  itemKey: string,
): string {
  const group = groupsById.get(groupId)
  const item = group?.items.find((candidate) => candidate._key === itemKey)
  return item ? `Requires ${item.title}` : 'Required option is unavailable'
}

/** Derives visible disabled states and reports selected values that violate content-owned rules. */
export function evaluateCustomizationConstraints(
  groups: SanityCustomizationGroup[],
  selections: CustomizationSelections,
): CustomizationConstraintEvaluation {
  const groupsById = new Map(groups.map((group) => [group._id, group]))
  const violations: CustomizationConstraintViolation[] = []

  const evaluatedGroups = groups.map((group) => {
    const selectedKeys = selectedItemKeys(group, selections)
    const maxSelections = group.selectionType === 'multiple' ? group.maxSelections : undefined
    const selectedInItemOrder = group.items
      .flatMap((item) => item._key
        ? selectedKeys.filter((selectedKey) => selectedKey === item._key)
        : [])
    const duplicateKeys = new Set(
      selectedKeys.filter((key, index) => selectedKeys.indexOf(key) !== index),
    )
    const selectedAboveLimit = new Set(
      maxSelections === undefined ? [] : selectedInItemOrder.slice(maxSelections),
    )
    const limitReached = maxSelections !== undefined && selectedKeys.length >= maxSelections
    const limitMessage = `Choose no more than ${maxSelections} ${group.title} options`

    return {
      ...group,
      items: group.items.map((item) => {
        const itemKey = item._key
        const missingRequirement = item.selectionRequirements?.find((requirement) => {
          const requiredGroup = groupsById.get(requirement.groupId)
          return !requiredGroup || !isSelected(requiredGroup, requirement.itemKey, selections)
        })
        const selected = itemKey ? selectedKeys.includes(itemKey) : false
        const disabledByLimit = Boolean(itemKey && limitReached && !selected)
        const disabledReason = missingRequirement
          ? requirementMessage(groupsById, missingRequirement.groupId, missingRequirement.itemKey)
          : disabledByLimit ? limitMessage : undefined

        if (itemKey && selected && missingRequirement) {
          violations.push({
            groupId: group._id,
            itemKey,
            itemTitle: item.title,
            message: disabledReason!,
            reason: 'missingRequirement',
          })
        } else if (itemKey && duplicateKeys.has(itemKey)) {
          violations.push({
            groupId: group._id,
            itemKey,
            itemTitle: item.title,
            message: `${item.title} can only be selected once`,
            reason: 'duplicateSelection',
          })
        } else if (itemKey && selectedAboveLimit.has(itemKey)) {
          violations.push({
            groupId: group._id,
            itemKey,
            itemTitle: item.title,
            message: limitMessage,
            reason: 'maxSelections',
          })
        }

        return {
          ...item,
          selectionDisabled: Boolean(disabledReason),
          selectionDisabledReason: disabledReason,
        }
      }),
    }
  })

  return { groups: evaluatedGroups, violations }
}

function removeSelection(
  selections: CustomizationSelections,
  group: SanityCustomizationGroup,
  itemKey: string,
): void {
  if (group.selectionType === 'multiple') {
    selections[group._id] = selectedItemKeys(group, selections).filter((key) => key !== itemKey)
  } else if (group.selectionType === 'single') {
    selections[group._id] = null
  } else {
    selections[group._id] = false
  }
}

export interface CustomizationConstraintReconciliation {
  selections: CustomizationSelections
  notes: CustomizationNotes
  removedTitles: string[]
}

/** Removes invalid selections to a fixed point so chained requirements cannot leave stale state. */
export function reconcileCustomizationConstraints(
  groups: SanityCustomizationGroup[],
  selections: CustomizationSelections,
  notes: CustomizationNotes,
): CustomizationConstraintReconciliation {
  const nextSelections: CustomizationSelections = { ...selections }
  const nextNotes: CustomizationNotes = { ...notes }
  const groupsById = new Map(groups.map((group) => [group._id, group]))
  const removedTitles: string[] = []
  const removedKeys = new Set<string>()

  while (true) {
    const { violations } = evaluateCustomizationConstraints(groups, nextSelections)
    if (violations.length === 0) break

    for (const violation of violations) {
      const compoundKey = `${violation.groupId}:${violation.itemKey}`
      const group = groupsById.get(violation.groupId)
      if (!group || removedKeys.has(compoundKey)) continue
      if (violation.reason === 'duplicateSelection' && group.selectionType === 'multiple') {
        nextSelections[group._id] = [...new Set(selectedItemKeys(group, nextSelections))]
        continue
      }
      removeSelection(nextSelections, group, violation.itemKey)
      delete nextNotes[compoundKey]
      removedKeys.add(compoundKey)
      removedTitles.push(violation.itemTitle)
    }
  }

  return { selections: nextSelections, notes: nextNotes, removedTitles }
}
