import type {
  PortableTextBlock,
  PortableTextTextBlock,
} from "~/types/portableText";

/** One run of text with its decorators (`strong`, `em`, `code`) and, when linked, its href. */
export interface PortableTextSegment {
  text: string;
  decorators: string[];
  href?: string;
}

/** A list item's text, and the deeper list (`level` + 1) that follows it, if any. */
export interface PortableTextListItem {
  spans: PortableTextSegment[];
  nested?: PortableTextList;
}

export interface PortableTextList {
  kind: "list";
  listItem: string;
  items: PortableTextListItem[];
}

export type PortableTextNode =
  | { kind: "block"; style: string; spans: PortableTextSegment[] }
  | PortableTextList
  | { kind: "image"; assetRef: string | undefined; alt: string | undefined; caption: string | undefined };

function segmentsOf(block: PortableTextTextBlock): PortableTextSegment[] {
  const links = new Map(
    (block.markDefs ?? []).map((markDef) => [markDef._key, markDef.href]),
  );

  return (block.children ?? []).map((child) => {
    const marks = child.marks ?? [];
    const href = marks.map((mark) => links.get(mark)).find(Boolean);
    const decorators = marks.filter((mark) => !links.has(mark));
    return href ? { text: child.text, decorators, href } : { text: child.text, decorators };
  });
}

/**
 * Flattens Portable Text into what a template renders: text blocks, lists (consecutive list items
 * of one kind grouped; an item one `level` deeper nests under the item before it) and images.
 *
 * Kept separate from the component so the shape is testable without a DOM, and so the FAQ
 * accordion and any body field render through the same rules.
 */
export function toPortableTextNodes(
  blocks: PortableTextBlock[] | null | undefined,
): PortableTextNode[] {
  const nodes: PortableTextNode[] = [];
  /** The lists of the current run, outermost first: `open[level - 1]`. */
  let open: PortableTextList[] = [];

  for (const block of blocks ?? []) {
    if (!(block._type === "block" && block.listItem)) open = [];

    if (block._type === "image") {
      nodes.push({
        kind: "image",
        assetRef: block.asset?._ref,
        alt: block.alt,
        caption: block.caption,
      });
      continue;
    }
    if (block._type !== "block") continue;

    const spans = segmentsOf(block);
    if (block.listItem) {
      // A level with no open parent item (e.g. the first item is level 2) nests as deep as it can.
      const depth = Math.min(Math.max((block.level ?? 1) - 1, 0), open.length);
      open = open.slice(0, depth + 1);
      let list = open[depth];
      if (!list || list.listItem !== block.listItem) {
        list = { kind: "list", listItem: block.listItem, items: [] };
        const parentItem = depth > 0 ? open[depth - 1]!.items.at(-1) : undefined;
        if (parentItem) parentItem.nested = list;
        else nodes.push(list);
        open = [...open.slice(0, depth), list];
      }
      list.items.push({ spans });
      continue;
    }

    nodes.push({ kind: "block", style: block.style ?? "normal", spans });
  }

  return nodes;
}

/**
 * The text of every block, one per line, without marks or images.
 *
 * Structured data (FAQPage answers) is built from this, so it carries exactly the words the page
 * shows.
 */
export function portableTextToPlainText(
  blocks: PortableTextBlock[] | null | undefined,
): string {
  return (blocks ?? [])
    .filter((block): block is PortableTextTextBlock => block._type === "block")
    .map((block) => (block.children ?? []).map((child) => child.text).join(""))
    .join("\n");
}
