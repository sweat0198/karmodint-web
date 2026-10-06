/**
 * Portable Text as the site reads it from Sanity: the `blockContent` field and the `faqItem`
 * answer. Mirrors the whitelist in `sanity/schemas/objects/blockContentSpec.ts` — type only, so the
 * app never bundles the Studio schema.
 */
export interface PortableTextSpan {
  _type: "span";
  _key?: string;
  text: string;
  marks?: string[];
}

export interface PortableTextLinkDef {
  _key: string;
  _type: string;
  href?: string;
}

export interface PortableTextTextBlock {
  _type: "block";
  _key?: string;
  style?: string;
  listItem?: string;
  level?: number;
  children: PortableTextSpan[];
  markDefs?: PortableTextLinkDef[];
}

export interface PortableTextImageBlock {
  _type: "image";
  _key?: string;
  asset?: { _type?: "reference"; _ref: string };
  alt?: string;
  caption?: string;
}

export type PortableTextBlock = PortableTextTextBlock | PortableTextImageBlock;
