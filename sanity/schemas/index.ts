import { categoryType } from './category'
import { productType } from './product'
import { customizationGroupType } from './customizationGroup'
import { quoteEnquiryType } from './quoteEnquiry'
import { clientReferenceType } from './reference'
import { galleryEntryType } from './galleryEntry'
import { solutionType } from './solution'
import { productLineType } from './productLine'
import { blockContent } from './objects/blockContent'
import { sizeOption } from './objects/sizeOption'
import { customizationItem } from './objects/customizationItem'
import { specItem } from './objects/specItem'
import { seo } from './objects/seo'
import { quoteItem } from './objects/quoteItem'
import { productCustomizationConfiguration } from './objects/productCustomizationConfiguration'
import { solutionProduct } from './objects/solutionProduct'
import { faqItem } from './objects/faqItem'

export const schemaTypes = [
  // Document types
  productType,
  categoryType,
  customizationGroupType,
  quoteEnquiryType,
  clientReferenceType,
  galleryEntryType,
  solutionType,
  productLineType,

  // Object types
  blockContent,
  sizeOption,
  customizationItem,
  specItem,
  seo,
  quoteItem,
  productCustomizationConfiguration,
  solutionProduct,
  faqItem
]
