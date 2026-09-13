import type { GalleryEntry } from "~/types/gallery";

export type { GalleryEntry };

export const GALLERY_ENTRIES_QUERY = `*[
  _type == "galleryEntry" && !(_id in path("drafts.**"))
] {
  _id,
  projectTitle,
  image,
  description,
  order,
  "category": category->{ _id, name, "slug": slug.current, displayOrder },
  "_sortOrder": coalesce(order, 2147483647)
} | order(_sortOrder asc, projectTitle asc) {
  _id,
  projectTitle,
  image,
  description,
  order,
  category
}`;
