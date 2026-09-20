import { describe, it, expect } from 'vitest'
import { schemaTypes } from '../../sanity/schemas'
import {
  createSizeRuleSnapshot,
  getCustomizationConfigurationWarning,
  productType,
  validateExactlyOneDefaultSize,
  validatePublishedCustomizationRules,
} from '../../sanity/schemas/product'
import { categoryType } from '../../sanity/schemas/category'
import { customizationGroupType, validateBooleanGroup } from '../../sanity/schemas/customizationGroup'
import { quoteEnquiryType } from '../../sanity/schemas/quoteEnquiry'
import { clientReferenceType } from '../../sanity/schemas/reference'
import { galleryEntryType, validateGalleryOrder } from '../../sanity/schemas/galleryEntry'
import { customizationItem } from '../../sanity/schemas/objects/customizationItem'
import { sizeOption, validateSizeImages } from '../../sanity/schemas/objects/sizeOption'
import {
  productCustomizationConfiguration,
  validateItemOverrideKeys,
  validateItemOverrides,
} from '../../sanity/schemas/objects/productCustomizationConfiguration'

describe('Sanity Schemas Structure & Validation Rules', () => {
  it('registers all required document and object types in schema index', () => {
    const typeNames = schemaTypes.map((t: any) => t.name)
    expect(typeNames).toContain('product')
    expect(typeNames).toContain('category')
    expect(typeNames).toContain('customizationGroup')
    expect(typeNames).toContain('quoteEnquiry')
    expect(typeNames).toContain('clientReference')
    expect(typeNames).toContain('galleryEntry')
    expect(typeNames).toContain('sizeOption')
    expect(typeNames).toContain('quoteItem')
    expect(typeNames).toContain('customizationItem')
    expect(typeNames).toContain('productCustomizationConfiguration')
    expect(typeNames).toContain('specItem')
    expect(typeNames).toContain('seo')
  })

  it('uses a non-reserved name for the reference document type', () => {
    const typeNames = schemaTypes.map((t: any) => t.name)

    expect(typeNames).not.toContain('reference')
    expect(typeNames).toContain('clientReference')
  })

  describe('Reference Schema', () => {
    it('defines the agreed required and optional fields', () => {
      const fields = Object.fromEntries(clientReferenceType.fields.map((field: any) => [field.name, field]))

      expect(Object.keys(fields)).toEqual([
        'companyName',
        'location',
        'logo',
        'website',
        'displayOrder'
      ])
      expect(fields.companyName.type).toBe('string')
      expect(fields.location.type).toBe('string')
      expect(fields.logo.type).toBe('image')
      expect(fields.website.type).toBe('url')
      expect(fields.displayOrder.type).toBe('number')
      expect(fields.displayOrder.initialValue).toBeUndefined()
    })

    it('provides display-order and alphabetical Studio orderings', () => {
      expect(clientReferenceType.orderings?.map((ordering) => ordering.name)).toEqual([
        'displayOrderAsc',
        'companyNameAsc'
      ])
    })
  })

  describe('Gallery Entry Schema', () => {
    it('defines the agreed fields and category relation', () => {
      const fields = Object.fromEntries(galleryEntryType.fields.map((field: any) => [field.name, field]))

      expect(Object.keys(fields)).toEqual([
        'projectTitle',
        'image',
        'category',
        'description',
        'order'
      ])
      expect(fields.projectTitle.type).toBe('string')
      expect(fields.image.type).toBe('image')
      expect(fields.image.options).toEqual({ hotspot: true })
      expect(fields.image.fields[0].name).toBe('alt')
      expect(fields.category.type).toBe('reference')
      expect(fields.category.to).toEqual([{ type: 'category' }])
      expect(fields.description.type).toBe('text')
      expect(fields.order.type).toBe('number')
      expect(fields.order.initialValue).toBeUndefined()
    })

    it('allows unordered entries and only accepts positive whole-number positions', () => {
      expect(validateGalleryOrder(undefined)).toBe(true)
      expect(validateGalleryOrder(null)).toBe(true)
      expect(validateGalleryOrder(1)).toBe(true)
      expect(validateGalleryOrder(4.5)).toContain('whole number')
      expect(validateGalleryOrder(0)).toContain('greater than zero')
    })

    it('provides manual and alphabetical orderings', () => {
      expect(galleryEntryType.orderings?.map((ordering) => ordering.name)).toEqual([
        'orderAsc',
        'projectTitleAsc'
      ])
    })
  })

  describe('Product Schema', () => {
    it('does not force a default portable-container size, but preserves the default rule elsewhere', () => {
      expect(validateExactlyOneDefaultSize([{ isDefault: false }], {
        categories: [{ _ref: 'category-containers' }]
      })).toBe(true)
      expect(validateExactlyOneDefaultSize([{ isDefault: false }], {
        categories: [{ _ref: 'category-kiosks' }]
      })).toContain('Exactly one size')
    })

    it('defines essential product fields and relations', () => {
      const fieldNames = productType.fields.map((f: any) => f.name)
      expect(fieldNames).toContain('name')
      expect(fieldNames).toContain('slug')
      expect(fieldNames).toContain('shortDescription')
      expect(fieldNames).toContain('description')
      expect(fieldNames).toContain('categories')
      expect(fieldNames).toContain('lifestyleImages')
      expect(fieldNames).toContain('representativeImages')
      expect(fieldNames).toContain('sizes')
      expect(fieldNames).not.toContain('customizationGroups')
      expect(fieldNames).toContain('customizationConfigurations')
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

    it('defines Product customization configurations as the only customization relation', () => {
      const configurationsField: any = productType.fields.find((f: any) => f.name === 'customizationConfigurations')

      expect(configurationsField.type).toBe('array')
      expect(configurationsField.of[0].type).toBe('productCustomizationConfiguration')

      const fields = Object.fromEntries(productCustomizationConfiguration.fields.map((field: any) => [field.name, field]))
      expect(fields.group.type).toBe('reference')
      expect(fields.group.to).toEqual([{ type: 'customizationGroup' }])
      expect(fields.itemOverrides.type).toBe('array')
      expect(fields.itemOverrides.of[0].fields.map((field: any) => field.name)).toEqual([
        'itemKey', 'enabled', 'pricingType', 'price', 'titleOverride', 'descriptionOverride', 'sizeRules'
      ])

      const sizeRuleFields = fields.itemOverrides.of[0].fields
        .find((field: any) => field.name === 'sizeRules').of[0].fields
      expect(sizeRuleFields.map((field: any) => field.name)).toEqual([
        'sizeOptionKey', 'mode', 'price', 'titleOverride', 'descriptionOverride', 'review'
      ])
      expect(sizeRuleFields.find((field: any) => field.name === 'mode').options.list.map((option: any) => option.value))
        .toEqual(['inherit', 'fixed', 'included', 'poa', 'unavailable'])
    })

    it('rejects duplicate Product overrides for one Customization Item', () => {
      expect(validateItemOverrides([
        { itemKey: 'elec-2' },
        { itemKey: 'elec-2' }
      ])).toContain('one override')
    })

    it('rejects an override key that is not present in the selected Customization Group', () => {
      expect(validateItemOverrideKeys([{ itemKey: 'elec-2' }], ['elec-1'])).toContain('does not exist')
    })

    it('requires native size rules to identify one size, a mode, and a valid fixed price', () => {
      const sizeRulesField: any = productCustomizationConfiguration.fields
        .find((field: any) => field.name === 'itemOverrides').of[0].fields
        .find((field: any) => field.name === 'sizeRules')
      const ruleFields = Object.fromEntries(sizeRulesField.of[0].fields.map((field: any) => [field.name, field]))

      expect(ruleFields.sizeOptionKey.validation).toBeDefined()
      expect(ruleFields.mode.validation).toBeDefined()
      expect(ruleFields.price.hidden({ parent: { mode: 'fixed' } })).toBe(false)
      expect(ruleFields.price.hidden({ parent: { mode: 'included' } })).toBe(true)
    })

    it('rejects published products with orphaned items or stale size rules', () => {
      const group = {
        _id: 'group-electricity',
        isMandatory: false,
        items: [{ _key: 'elec-1', scope: 'universal' }]
      }
      const document = {
        status: 'published',
        sizes: [{ _key: 'small', lengthM: 3, widthM: 2.4, heightM: 2.6 }],
        customizationConfigurations: [{
          group: { _ref: 'group-electricity' },
          itemOverrides: [{
            itemKey: 'gone-item',
            sizeRules: [{
              sizeOptionKey: 'gone-size',
              mode: 'included',
              review: { status: 'reviewed', snapshot: 'anything' }
            }]
          }]
        }]
      }

      expect(validatePublishedCustomizationRules(document, [group])).toContain('gone-item')
    })

    it('requires every size-dependent item to have a reviewed current rule before publishing', () => {
      const sizes = [
        { _key: 'small', lengthM: 3, widthM: 2.4, heightM: 2.6 },
        { _key: 'large', lengthM: 6, widthM: 2.4, heightM: 2.6 }
      ]
      const group = {
        _id: 'group-electricity',
        isMandatory: false,
        items: [{ _key: 'elec-1', scope: 'sizeDependent' }]
      }
      const document = {
        status: 'published',
        sizes,
        customizationConfigurations: [{
          group: { _ref: 'group-electricity' },
          itemOverrides: [{
            itemKey: 'elec-1',
            sizeRules: [{
              sizeOptionKey: 'small',
              mode: 'included',
              review: { status: 'reviewed', snapshot: createSizeRuleSnapshot(sizes[0], { mode: 'included' }) }
            }]
          }]
        }]
      }

      expect(validatePublishedCustomizationRules(document, [group])).toContain('large')
    })

    it('rejects pending and dimension-drifted size-rule reviews when publishing', () => {
      const size = { _key: 'small', lengthM: 3, widthM: 2.4, heightM: 2.6 }
      const group = {
        _id: 'group-electricity',
        isMandatory: false,
        items: [{ _key: 'elec-1', scope: 'universal' }]
      }
      const rule = {
        sizeOptionKey: 'small',
        mode: 'included',
        review: { status: 'pending', snapshot: createSizeRuleSnapshot(size, { mode: 'included' }) }
      }
      const document = {
        status: 'published',
        sizes: [size],
        customizationConfigurations: [{ group: { _ref: 'group-electricity' }, itemOverrides: [{ itemKey: 'elec-1', sizeRules: [rule] }] }]
      }

      expect(validatePublishedCustomizationRules(document, [group])).toContain('must be reviewed')
      rule.review.status = 'reviewed'
      document.sizes[0].widthM = 3
      expect(validatePublishedCustomizationRules(document, [group])).toContain('dimensions changed')
    })

    it('rejects a mandatory group that has no available item for a size', () => {
      const size = { _key: 'small', lengthM: 3, widthM: 2.4 }
      const group = {
        _id: 'group-wc',
        isMandatory: true,
        items: [{ _key: 'wc', scope: 'universal' }]
      }
      const document = {
        status: 'published',
        sizes: [size],
        customizationConfigurations: [{
          group: { _ref: 'group-wc' },
          itemOverrides: [{ itemKey: 'wc', enabled: false }]
        }]
      }

      expect(validatePublishedCustomizationRules(document, [group])).toContain('no available items')
    })

    it('leaves incomplete rules valid while a product is a draft', () => {
      expect(validatePublishedCustomizationRules({
        status: 'draft',
        sizes: [{ _key: 'small', lengthM: 3, widthM: 2.4 }],
        customizationConfigurations: [{
          group: { _ref: 'missing' },
          itemOverrides: [{ itemKey: 'gone', sizeRules: [{ sizeOptionKey: 'gone-size', mode: 'fixed' }] }]
        }]
      }, [])).toBe(true)
    })

    it('shows a non-blocking draft warning for stale, orphaned, or unreviewed rules', () => {
      const group = {
        _id: 'group-electricity',
        isMandatory: false,
        items: [{ _key: 'elec-1', scope: 'sizeDependent' as const }]
      }
      const missingReview = getCustomizationConfigurationWarning({
        status: 'draft',
        sizes: [{ _key: 'small', lengthM: 3, widthM: 2.4 }],
        customizationConfigurations: [{
          group: { _ref: 'group-electricity' },
          itemOverrides: [{ itemKey: 'elec-1' }]
        }]
      }, [group])
      const orphan = getCustomizationConfigurationWarning({
        status: 'draft',
        sizes: [{ _key: 'small', lengthM: 3, widthM: 2.4 }],
        customizationConfigurations: [{
          group: { _ref: 'group-electricity' },
          itemOverrides: [{ itemKey: 'missing' }]
        }]
      }, [group])
      const stale = getCustomizationConfigurationWarning({
        status: 'draft',
        sizes: [{ _key: 'small', lengthM: 3, widthM: 2.4 }],
        customizationConfigurations: [{
          group: { _ref: 'group-electricity' },
          itemOverrides: [{
            itemKey: 'elec-1',
            sizeRules: [{
              sizeOptionKey: 'small',
              mode: 'included',
              review: { status: 'reviewed', snapshot: 'old dimensions' }
            }]
          }]
        }]
      }, [group])

      expect(missingReview).toContain('needs a reviewed rule')
      expect(orphan).toContain('missing')
      expect(stale).toContain('dimensions changed')
    })

    it('snapshots every reviewed rule value that changes size-dependent equipment', () => {
      const size = { _key: 'small', label: 'Small Cabin', lengthM: 3, widthM: 2.4, heightM: 2.6 }
      const included = createSizeRuleSnapshot(size, { mode: 'included' })

      expect(included).toContain('"sizeOptionKey":"small"')
      expect(included).toContain('"lengthM":3')
      expect(createSizeRuleSnapshot(size, { mode: 'fixed', price: 200 })).not.toBe(included)
      expect(createSizeRuleSnapshot(size, { mode: 'included', titleOverride: '2 lights' })).not.toBe(included)
      expect(createSizeRuleSnapshot(size, { mode: 'included', descriptionOverride: 'Two lights and four sockets' }))
        .not.toBe(included)
    })

    it('invalidates reviewed size rules when inherited Product or item values change', () => {
      const size = { _key: 'small', lengthM: 3, widthM: 2.4, heightM: 2.6 }
      const item = {
        _key: 'elec-1',
        scope: 'sizeDependent' as const,
        title: '1 light, 2 sockets',
        description: 'Standard electrical layout',
        pricingType: 'fixed' as const,
        price: 100
      }
      const override = {
        itemKey: 'elec-1',
        pricingType: 'fixed' as const,
        price: 150,
        titleOverride: 'Product electrical layout',
        descriptionOverride: 'Product-specific electrical layout'
      }
      const rule = {
        sizeOptionKey: 'small',
        mode: 'inherit' as const,
        review: { status: 'reviewed' as const, snapshot: createSizeRuleSnapshot(size, { mode: 'inherit' }, override, item) }
      }
      const document = {
        status: 'published',
        sizes: [size],
        customizationConfigurations: [{ group: { _ref: 'group-electricity' }, itemOverrides: [{ ...override, sizeRules: [rule] }] }]
      }
      const group = { _id: 'group-electricity', isMandatory: false, items: [item] }

      expect(validatePublishedCustomizationRules(document, [group])).toBe(true)

      document.customizationConfigurations[0].itemOverrides[0].price = 175
      expect(validatePublishedCustomizationRules(document, [group])).toContain('dimensions changed')
      document.customizationConfigurations[0].itemOverrides[0].price = 150
      document.customizationConfigurations[0].itemOverrides[0].titleOverride = 'Updated product layout'
      expect(validatePublishedCustomizationRules(document, [group])).toContain('dimensions changed')
      document.customizationConfigurations[0].itemOverrides[0].titleOverride = 'Product electrical layout'
      document.customizationConfigurations[0].itemOverrides[0].descriptionOverride = 'Updated product description'
      expect(validatePublishedCustomizationRules(document, [group])).toContain('dimensions changed')

      const itemInheritedRule = {
        sizeOptionKey: 'small',
        mode: 'inherit' as const,
        review: { status: 'reviewed' as const, snapshot: createSizeRuleSnapshot(size, { mode: 'inherit' }, undefined, item) }
      }
      const itemInheritedDocument = {
        status: 'published',
        sizes: [size],
        customizationConfigurations: [{ group: { _ref: 'group-electricity' }, itemOverrides: [{ itemKey: 'elec-1', sizeRules: [itemInheritedRule] }] }]
      }

      expect(validatePublishedCustomizationRules(itemInheritedDocument, [group])).toBe(true)
      group.items[0].price = 200
      expect(validatePublishedCustomizationRules(itemInheritedDocument, [group])).toContain('dimensions changed')
      group.items[0].price = 100
      group.items[0].title = 'Updated item layout'
      expect(validatePublishedCustomizationRules(itemInheritedDocument, [group])).toContain('dimensions changed')
      group.items[0].title = '1 light, 2 sockets'
      group.items[0].description = 'Updated item electrical layout'
      expect(validatePublishedCustomizationRules(itemInheritedDocument, [group])).toContain('dimensions changed')
    })

    it('lists Product Size Option keys and labels when a rule uses an unknown key', () => {
      const group = {
        _id: 'group-electricity',
        isMandatory: false,
        items: [{ _key: 'elec-1', scope: 'universal' as const }]
      }

      expect(validatePublishedCustomizationRules({
        status: 'published',
        sizes: [{ _key: 'small', label: 'Small Cabin', lengthM: 3, widthM: 2.4 }],
        customizationConfigurations: [{
          group: { _ref: 'group-electricity' },
          itemOverrides: [{
            itemKey: 'elec-1',
            sizeRules: [{ sizeOptionKey: 'unknown', mode: 'included' }]
          }]
        }]
      }, [group])).toContain('small (Small Cabin)')
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
    it('allows a portable-container size to use a representative image while retaining other image requirements', () => {
      expect(validateSizeImages([], { categories: [{ _ref: 'category-containers' }] })).toBe(true)
      expect(validateSizeImages([], { categories: [{ _ref: 'category-kiosks' }] }))
        .toBe('Each size needs at least one render')
      expect(validateSizeImages([{ view: 'front' }], { categories: [{ _ref: 'category-kiosks' }] }))
        .toContain('exactly one image')
    })

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

    it('tells editors the toggle mode takes exactly one option', () => {
      const selectionTypeField: any = customizationGroupType.fields.find(
        (f: any) => f.name === 'selectionType'
      )
      const booleanOption = selectionTypeField.options.list.find((o: any) => o.value === 'boolean')
      expect(booleanOption.title).toMatch(/exactly one option/i)
    })
  })

  describe('validateBooleanGroup', () => {
    it('rejects a boolean group with more than one item', () => {
      expect(
        validateBooleanGroup({
          selectionType: 'boolean',
          isMandatory: false,
          items: [{ title: 'A' }, { title: 'B' }]
        })
      ).toBe('A toggle group must have exactly one option (found 2)')
    })

    it('rejects a mandatory boolean group', () => {
      expect(
        validateBooleanGroup({
          selectionType: 'boolean',
          isMandatory: true,
          items: [{ title: 'A' }]
        })
      ).toBe('A toggle group cannot be mandatory — it is optional by definition')
    })

    it('accepts a non-mandatory boolean group with exactly one item', () => {
      expect(
        validateBooleanGroup({
          selectionType: 'boolean',
          isMandatory: false,
          items: [{ title: 'A' }]
        })
      ).toBe(true)
    })

    it('leaves single and multiple groups unaffected', () => {
      expect(
        validateBooleanGroup({
          selectionType: 'single',
          isMandatory: true,
          items: [{ title: 'A' }, { title: 'B' }]
        })
      ).toBe(true)
      expect(
        validateBooleanGroup({
          selectionType: 'multiple',
          isMandatory: true,
          items: [{ title: 'A' }, { title: 'B' }]
        })
      ).toBe(true)
    })

    it('defers to the required/min rule when items are absent', () => {
      expect(validateBooleanGroup({ selectionType: 'boolean', isMandatory: false, items: undefined })).toBe(
        true
      )
      expect(validateBooleanGroup({ selectionType: 'boolean', isMandatory: false, items: [] })).toBe(true)
    })
  })

  describe('Customization Item Schema', () => {
    it('defines pricing and cross-item selection requirements', () => {
      const fieldNames = customizationItem.fields.map((f: any) => f.name)
      expect(fieldNames).toContain('title')
      expect(fieldNames).toContain('pricingType')
      expect(fieldNames).toContain('price')
      expect(fieldNames).toContain('requiresTextInput')
      expect(fieldNames).toContain('scope')
      expect(fieldNames).toContain('selectionRequirements')

      const requirements: any = customizationItem.fields.find((field: any) => (
        field.name === 'selectionRequirements'
      ))
      expect(requirements.type).toBe('array')
      expect(requirements.of[0].fields.map((field: any) => field.name)).toEqual([
        'group',
        'itemKey'
      ])
      expect(requirements.of[0].fields[0].to).toEqual([{ type: 'customizationGroup' }])
    })

    it('supports a selection limit only for multiple-choice groups', () => {
      const fields = Object.fromEntries(customizationGroupType.fields.map((field: any) => [field.name, field]))

      expect(fields.maxSelections.type).toBe('number')
      expect(fields.maxSelections.hidden({ parent: { selectionType: 'multiple' } })).toBe(false)
      expect(fields.maxSelections.hidden({ parent: { selectionType: 'single' } })).toBe(true)
    })

    it('rejects missing dependency targets and dependency cycles on published products', () => {
      const sizes = [{ _key: 'small', lengthM: 1, widthM: 1 }]
      const product = {
        status: 'published',
        sizes,
        customizationConfigurations: [
          { group: { _ref: 'electricity' } },
          { group: { _ref: 'heater' } }
        ]
      }
      const missingTargetGroups = [{
        _id: 'electricity',
        items: [{
          _key: 'blue',
          selectionRequirements: [{ group: { _ref: 'electricity' }, itemKey: 'missing' }]
        }]
      }, {
        _id: 'heater',
        items: [{ _key: 'heater', selectionRequirements: [] }]
      }]

      expect(validatePublishedCustomizationRules(product, missingTargetGroups))
        .toContain('missing')

      const cyclicGroups = [{
        _id: 'electricity',
        items: [{
          _key: 'standard',
          selectionRequirements: [{ group: { _ref: 'heater' }, itemKey: 'heater' }]
        }]
      }, {
        _id: 'heater',
        items: [{
          _key: 'heater',
          selectionRequirements: [{ group: { _ref: 'electricity' }, itemKey: 'standard' }]
        }]
      }]

      expect(validatePublishedCustomizationRules(product, cyclicGroups))
        .toContain('cycle')
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
