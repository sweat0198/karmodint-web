/** Sanity group `_id` -> the customer's selection. Shape follows the group's selectionType. */
export type CustomizationSelections = Record<string, string | null | string[] | boolean>
//  single   -> item `_key`, or null for "None / Not required"
//  multiple -> array of item `_key`s
//  boolean  -> on/off for the group's single item

/** "<groupId>:<itemKey>" -> the customer's free text for a requiresTextInput item. */
export type CustomizationNotes = Record<string, string>

export interface SpecSummaryItem {
  label: string;
  value: string;
}
