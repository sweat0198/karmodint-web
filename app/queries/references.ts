import type { ClientReference } from '~/types/reference'

export type { ClientReference }

export const REFERENCES_QUERY = `*[
  _type == "clientReference" && !(_id in path("drafts.**"))
] {
  _id,
  companyName,
  location,
  logo { asset },
  website,
  displayOrder,
  "_sortOrder": coalesce(displayOrder, 2147483647)
} | order(_sortOrder asc, companyName asc) {
  _id,
  companyName,
  location,
  logo,
  website,
  displayOrder
}`
