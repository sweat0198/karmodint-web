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
