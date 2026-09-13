export interface GalleryImageAsset {
  _type?: "image";
  asset?: {
    _type: "reference";
    _ref: string;
  };
  alt: string;
}

export interface GalleryCategoryRef {
  _id: string;
  name: string;
  slug: string;
  displayOrder?: number;
  /** The top-level category's slug, when this category is itself a subcategory (e.g. "cabin" for "metro-city"). */
  parentSlug?: string;
}

/** Raw shape returned by `GALLERY_ENTRIES_QUERY`. */
export interface GalleryEntry {
  _id: string;
  projectTitle: string;
  image: GalleryImageAsset;
  description?: string;
  order?: number;
  category: GalleryCategoryRef;
}

/** A category as it appears in the filter bar: how many visible tiles it covers, and in what order. */
export interface GalleryCategoryOption {
  slug: string;
  name: string;
  displayOrder: number;
  count: number;
}

/** A gallery entry once its image has been resolved to real URLs and a known aspect ratio. */
export interface GalleryTile {
  id: string;
  title: string;
  description?: string;
  category: GalleryCategoryRef;
  image: {
    src: string;
    srcset: string;
    alt: string;
    width: number;
    height: number;
    aspectRatio: number;
  };
}
