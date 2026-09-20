import type { CatalogProduct } from "~/queries/catalog";

export interface SolutionCoverImage {
  _type?: "image";
  asset?: {
    _type: "reference";
    _ref: string;
  };
  alt: string;
}

/** One curated (product, size) pair, with the product already dereferenced by the query. */
export interface SolutionProductEntry {
  _key?: string;
  product: CatalogProduct | null;
  sizeOptionKey: string;
}

/** A solution as the header submenu needs it — just enough to link to it. */
export interface SolutionNavItem {
  _id: string;
  name: string;
  slug: string;
}

/** A solution as the listing page needs it — no products dereferenced. */
export interface SolutionSummary {
  _id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: SolutionCoverImage;
  displayOrder?: number;
  productCount: number;
}

/** A single solution with its products resolved, as the detail page needs it. */
export interface Solution {
  _id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: SolutionCoverImage;
  displayOrder?: number;
  products: SolutionProductEntry[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    noIndex?: boolean;
  };
}
