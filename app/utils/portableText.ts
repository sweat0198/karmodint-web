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

export type PortableTextNode =
  | { kind: "block"; style: string; spans: PortableTextSegment[] }
  | { kind: "list"; listItem: string; items: PortableTextSegment[][] }
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
 * of one kind grouped, nesting flattened, which no ported copy uses) and images.
 *
 * Kept separate from the component so the shape is testable without a DOM, and so the FAQ
 * accordion and any body field render through the same rules.
 */
export function toPortableTextNodes(
  blocks: PortableTextBlock[] | null | undefined,
): PortableTextNode[] {
  const nodes: PortableTextNode[] = [];

  for (const block of blocks ?? []) {
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
      const previous = nodes[nodes.length - 1];
      if (previous?.kind === "list" && previous.listItem === block.listItem) {
        previous.items.push(spans);
      } else {
        nodes.push({ kind: "list", listItem: block.listItem, items: [spans] });
      }
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
