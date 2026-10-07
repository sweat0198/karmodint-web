import type { SanityImage, SanitySEO } from "~/types/catalog";
import type { FaqItem } from "~/types/faq";
import type { PortableTextBlock } from "~/types/portableText";

/** A Product Line's ancestor, as far as breadcrumbs need it. */
export interface ProductLineAncestor {
  name: string;
  path: string;
  parent?: ProductLineAncestor | null;
}

/** The catalogue category a Product Line lists, with what the grid and catalogue link need. */
export interface ProductLineCategory {
  _id: string;
  slug: string;
  /** The parent category's slug when this is a subcategory, for `/products/?category=…&subcategory=…`. */
  parentSlug: string | null;
  /** Published subcategory ids, whose products the grid also lists. */
  childIds: string[];
}

/** A Product Line page (ADR-004), as the catch-all route renders it. */
export interface ProductLine {
  _id: string;
  name: string;
  path: string;
  parent?: ProductLineAncestor | null;
  category?: ProductLineCategory | null;
  description: string;
  coverImage: SanityImage & { alt: string };
  body?: PortableTextBlock[];
  faqs?: FaqItem[];
  displayOrder?: number;
  seo?: SanitySEO;
}

/** A Product Line as the header and footer link to it. */
export interface ProductLineNavItem {
  _id: string;
  name: string;
  path: string;
  /** The catalogue category it lists; absent for a hub page. */
  categoryId?: string | null;
  hasParent: boolean;
}
