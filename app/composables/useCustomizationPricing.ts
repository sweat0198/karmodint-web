import { computed, toValue, type MaybeRefOrGetter } from "vue";
import type {
  SanityCustomizationGroup,
  SanityCustomizationItem,
  SanitySelectedCustomization,
  SanitySizeOption,
} from "~/types/catalog";
import type {
  CustomizationNotes,
  CustomizationSelections,
  SpecSummaryItem,
} from "~/types/customization";
import { getPriceLabel, getTotalLabel } from "~~/shared/utils/priceLabel";

function selectedItems(
  group: SanityCustomizationGroup,
  selections: CustomizationSelections,
): SanityCustomizationItem[] {
  const sel = selections[group._id];

  if (group.selectionType === "single") {
    if (!sel) return [];
    const item = group.items.find((i) => i._key === sel);
    return item ? [item] : [];
  }

  if (group.selectionType === "multiple") {
    const keys = (sel as string[] | undefined) ?? [];
    return group.items.filter((i) => keys.includes(i._key ?? ""));
  }

  // boolean
  if (sel === true) {
    return group.items[0] ? [group.items[0]] : [];
  }
  return [];
}

function itemPrice(item: SanityCustomizationItem): number | undefined {
  if (item.pricingType === "fixed") return item.price ?? 0;
  if (item.pricingType === "included") return 0;
  return undefined;
}

/** "<groupId>:<itemKey>" — the one place this composite key is built. */
export function noteKey(groupId: string, itemKey?: string): string {
  return `${groupId}:${itemKey}`;
}

/** Whether a group currently has a selection, regardless of whether it's mandatory. */
export function hasGroupSelection(
  group: SanityCustomizationGroup,
  selections: CustomizationSelections,
): boolean {
  const sel = selections[group._id];
  if (group.selectionType === "multiple") return ((sel as string[] | undefined)?.length ?? 0) > 0;
  return !!sel;
}

export function formatPriceBadge(
  item: SanityCustomizationItem,
  currencySymbol = "£",
): string {
  if (item.pricingType === "included") return "Included";
  if (item.pricingType === "poa") return getPriceLabel({ isPoa: true });
  return `+${getPriceLabel({ price: item.price }, currencySymbol)}`;
}

function isGroupMandatorySatisfied(
  group: SanityCustomizationGroup,
  selections: CustomizationSelections,
): boolean {
  // D8: boolean groups are never mandatory in the schema.
  if (!group.isMandatory || group.selectionType === "boolean") return true;
  return hasGroupSelection(group, selections);
}

export function buildSpecSummary(
  groups: SanityCustomizationGroup[],
  selections: CustomizationSelections,
): SpecSummaryItem[] {
  const summary: SpecSummaryItem[] = [];

  const ordered = [...groups].sort(
    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
  );

  for (const group of ordered) {
    const items = selectedItems(group, selections);
    if (items.length === 0) continue;

    summary.push({
      label: group.title,
      value: items.map((i) => i.title).join(" + "),
    });
  }

  return summary.slice(0, 4);
}

export function useCustomizationPricing(
  groups: MaybeRefOrGetter<SanityCustomizationGroup[]>,
  selections: MaybeRefOrGetter<CustomizationSelections>,
  notes: MaybeRefOrGetter<CustomizationNotes>,
  size: MaybeRefOrGetter<SanitySizeOption | undefined>,
) {
  const sizeIsPoa = computed(() => toValue(size)?.isPoa === true);

  const lines = computed<SanitySelectedCustomization[]>(() => {
    const groupList = toValue(groups);
    const selectionMap = toValue(selections);
    const notesMap = toValue(notes);
    const result: SanitySelectedCustomization[] = [];

    for (const group of groupList) {
      for (const item of selectedItems(group, selectionMap)) {
        result.push({
          groupTitle: group.title,
          optionTitle: item.title,
          price: itemPrice(item),
          isPoa: item.pricingType === "poa",
          customNotes: item.requiresTextInput
            ? notesMap[noteKey(group._id, item._key)]
            : undefined,
        });
      }
    }

    return result;
  });

  const poaItems = computed(() => lines.value.filter((line) => line.isPoa));

  const hasPoa = computed(() => sizeIsPoa.value || poaItems.value.length > 0);

  const subtotal = computed(() => {
    if (sizeIsPoa.value) return 0;

    const sizePrice = toValue(size)?.price ?? 0;
    const itemsTotal = lines.value.reduce(
      (sum, line) => sum + (line.isPoa ? 0 : line.price ?? 0),
      0,
    );
    return sizePrice + itemsTotal;
  });

  const priceLabel = computed(() =>
    sizeIsPoa.value
      ? getPriceLabel({ isPoa: true })
      : getTotalLabel({ total: subtotal.value, hasPoa: hasPoa.value }),
  );

  const unsatisfiedMandatory = computed(() =>
    toValue(groups).filter(
      (group) => !isGroupMandatorySatisfied(group, toValue(selections)),
    ),
  );

  return {
    subtotal,
    sizeIsPoa,
    poaItems,
    hasPoa,
    priceLabel,
    lines,
    unsatisfiedMandatory,
  };
}
