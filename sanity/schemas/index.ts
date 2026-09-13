import { categoryType } from './category'
import { productType } from './product'
import { customizationGroupType } from './customizationGroup'
import { quoteEnquiryType } from './quoteEnquiry'
import { clientReferenceType } from './reference'
import { galleryEntryType } from './galleryEntry'
import { blockContent } from './objects/blockContent'
import { sizeOption } from './objects/sizeOption'
import { customizationItem } from './objects/customizationItem'
import { specItem } from './objects/specItem'
import { seo } from './objects/seo'
import { quoteItem } from './objects/quoteItem'
import { productCustomizationConfiguration } from './objects/productCustomizationConfiguration'

export const schemaTypes = [
  // Document types
  productType,
  categoryType,
  customizationGroupType,
  quoteEnquiryType,
  clientReferenceType,
  galleryEntryType,

  // Object types
  blockContent,
  sizeOption,
  customizationItem,
  specItem,
  seo,
  quoteItem,
  productCustomizationConfiguration
]
