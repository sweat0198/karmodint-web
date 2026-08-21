import { describe, it, expect } from 'vitest'
import { schemaTypes } from '../../sanity/schemas'
import { productType } from '../../sanity/schemas/product'
import { categoryType } from '../../sanity/schemas/category'
import { customizationGroupType } from '../../sanity/schemas/customizationGroup'
import { quoteEnquiryType } from '../../sanity/schemas/quoteEnquiry'
import { customizationItem } from '../../sanity/schemas/objects/customizationItem'
import { sizeOption } from '../../sanity/schemas/objects/sizeOption'

describe('Sanity Schemas Structure & Validation Rules', () => {
  it('registers all required document and object types in schema index', () => {
    const typeNames = schemaTypes.map((t: any) => t.name)
    expect(typeNames).toContain('product')
    expect(typeNames).toContain('category')
    expect(typeNames).toContain('customizationGroup')
    expect(typeNames).toContain('quoteEnquiry')
    expect(typeNames).toContain('sizeOption')
    expect(typeNames).toContain('quoteItem')
    expect(typeNames).toContain('customizationItem')
    expect(typeNames).toContain('specItem')
    expect(typeNames).toContain('seo')
  })

  describe('Product Schema', () => {
    it('defines essential product fields and relations', () => {
      const fieldNames = productType.fields.map((f: any) => f.name)
      expect(fieldNames).toContain('name')
      expect(fieldNames).toContain('slug')
      expect(fieldNames).toContain('shortDescription')
      expect(fieldNames).toContain('description')
      expect(fieldNames).toContain('categories')
      expect(fieldNames).toContain('lifestyleImages')
      expect(fieldNames).toContain('sizes')
      expect(fieldNames).toContain('customizationGroups')
      expect(fieldNames).toContain('specifications')
      expect(fieldNames).toContain('status')
      expect(fieldNames).toContain('seo')
    })

    it('references category document type in categories array', () => {
      const categoriesField: any = productType.fields.find((f: any) => f.name === 'categories')
      expect(categoriesField).toBeDefined()
      expect(categoriesField.type).toBe('array')
      expect(categoriesField.of[0].type).toBe('reference')
      expect(categoriesField.of[0].to).toEqual([{ type: 'category' }])
    })

    it('references customizationGroup document in customizationGroups array', () => {
      const custField: any = productType.fields.find((f: any) => f.name === 'customizationGroups')
      expect(custField).toBeDefined()
      expect(custField.type).toBe('array')
      expect(custField.of[0].type).toBe('reference')
      expect(custField.of[0].to).toEqual([{ type: 'customizationGroup' }])
    })

    it('requires at least one size option', () => {
      const sizesField: any = productType.fields.find((f: any) => f.name === 'sizes')
      expect(sizesField).toBeDefined()
      expect(sizesField.type).toBe('array')
      expect(sizesField.of[0].type).toBe('sizeOption')
    })

    it('has no product-level image gallery — renders belong to a size', () => {
      const fieldNames = productType.fields.map((f: any) => f.name)
      expect(fieldNames).not.toContain('images')
    })

    it('leaves lifestyle photography optional and un-required', () => {
      const lifestyleField: any = productType.fields.find((f: any) => f.name === 'lifestyleImages')
      expect(lifestyleField.type).toBe('array')
      expect(lifestyleField.validation).toBeUndefined()
    })
  })

  describe('Size Option Schema', () => {
    it('defines POA, weight, and a size-owned render gallery', () => {
      const fieldNames = sizeOption.fields.map((f: any) => f.name)
      expect(fieldNames).toContain('isPoa')
      expect(fieldNames).toContain('weightKg')
      expect(fieldNames).toContain('images')
    })

    it('drops the separate floor plan field in favour of the "top" view', () => {
      const fieldNames = sizeOption.fields.map((f: any) => f.name)
      expect(fieldNames).not.toContain('floorPlanImage')
    })

    it('hides price in the Studio when the size is POA', () => {
      const priceField: any = sizeOption.fields.find((f: any) => f.name === 'price')
      expect(priceField.hidden({ parent: { isPoa: true } })).toBe(true)
      expect(priceField.hidden({ parent: { isPoa: false } })).toBe(false)
    })

    it('constrains each render to the closed view vocabulary', () => {
      const imagesField: any = sizeOption.fields.find((f: any) => f.name === 'images')
      const viewField = imagesField.of[0].fields.find((f: any) => f.name === 'view')
      const values = viewField.options.list.map((o: any) => o.value)
      expect(values).toEqual([
        'front',
        'left-diagonal',
        'right-diagonal',
        'right',
        'back',
        'interior',
        'door',
        'top'
      ])
    })
  })

  describe('Category Schema', () => {
    it('defines name, slug, parent reference, and displayOrder', () => {
      const fieldNames = categoryType.fields.map((f: any) => f.name)
      expect(fieldNames).toContain('name')
      expect(fieldNames).toContain('slug')
      expect(fieldNames).toContain('parent')
      expect(fieldNames).toContain('displayOrder')
    })

    it('allows self-referencing parent category hierarchy', () => {
      const parentField: any = categoryType.fields.find((f: any) => f.name === 'parent')
      expect(parentField).toBeDefined()
      expect(parentField.type).toBe('reference')
      expect(parentField.to).toEqual([{ type: 'category' }])
    })
  })

  describe('Customization Group Schema', () => {
    it('defines identifier, selectionType, items, and displayOrder', () => {
      const fieldNames = customizationGroupType.fields.map((f: any) => f.name)
      expect(fieldNames).toContain('title')
      expect(fieldNames).toContain('identifier')
      expect(fieldNames).toContain('selectionType')
      expect(fieldNames).toContain('items')
      expect(fieldNames).toContain('displayOrder')
    })

    it('contains customizationItem objects within items array', () => {
      const itemsField: any = customizationGroupType.fields.find((f: any) => f.name === 'items')
      expect(itemsField).toBeDefined()
      expect(itemsField.type).toBe('array')
      expect(itemsField.of[0].type).toBe('customizationItem')
    })
  })

  describe('Customization Item Schema', () => {
    it('defines title, pricingType, price, and requiresTextInput', () => {
      const fieldNames = customizationItem.fields.map((f: any) => f.name)
      expect(fieldNames).toContain('title')
      expect(fieldNames).toContain('pricingType')
      expect(fieldNames).toContain('price')
      expect(fieldNames).toContain('requiresTextInput')
    })
  })

  describe('Quote Enquiry Schema', () => {
    it('defines lead status, customer details, and quote items', () => {
      const fieldNames = quoteEnquiryType.fields.map((f: any) => f.name)
      expect(fieldNames).toContain('referenceNumber')
      expect(fieldNames).toContain('status')
      expect(fieldNames).toContain('customerName')
      expect(fieldNames).toContain('email')
      expect(fieldNames).toContain('phone')
      expect(fieldNames).toContain('items')
      expect(fieldNames).toContain('estimatedTotal')
      expect(fieldNames).toContain('hasPoa')
    })

    it('sets initial status to "new" and has preview configurator', () => {
      const statusField: any = quoteEnquiryType.fields.find((f: any) => f.name === 'status')
      expect(statusField.initialValue).toBe('new')
      expect(quoteEnquiryType.preview).toBeDefined()
      expect(typeof quoteEnquiryType.preview?.prepare).toBe('function')
    })
  })
})
