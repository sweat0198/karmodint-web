import { describe, it, expect } from 'vitest'
import { revalidateQuoteItems } from '../../server/utils/quoteRevalidation'
import type { SanityProduct } from '../../app/types/catalog'
import type { QuoteLine } from '../../shared/utils/quoteLine'

const CABIN_PRODUCT: SanityProduct = {
  _id: 'site-office-cabin-20ft',
  _type: 'product',
  name: 'Site Office Cabin 20ft',
  slug: { current: 'site-office-cabin-20ft' },
  categories: [],
  status: 'published',
  sizes: [
    { _key: 'standard', label: '2.40m x 6.00m (Standard)', lengthM: 6, widthM: 2.4, price: 8500, isPoa: false, images: [] },
  ],
  customizationConfigurations: [
    {
      group: {
        _id: 'grp-electrical',
        _type: 'customizationGroup',
        title: 'Electrical Package',
        identifier: 'electrical',
        selectionType: 'single',
        items: [
          { _key: 'standard-elec', title: 'Standard package', pricingType: 'included' },
          { _key: 'upgraded-elec', title: 'Upgraded electrical package', pricingType: 'fixed', price: 1300 },
        ],
      },
      itemOverrides: [],
    },
  ],
}

const POA_PRODUCT: SanityProduct = {
  _id: 'blast-cabin',
  _type: 'product',
  name: 'Bespoke Armoured Blast Cabin',
  slug: { current: 'blast-cabin' },
  categories: [],
  status: 'published',
  sizes: [
    { _key: 'custom', label: 'Custom Spec', lengthM: 1, widthM: 1, price: 0, isPoa: true, images: [] },
  ],
}

function productsById(...products: SanityProduct[]): Map<string, SanityProduct> {
  return new Map(products.map((p) => [p._id, p]))
}

function baseLine(overrides: Partial<QuoteLine> = {}): QuoteLine {
  return {
    id: 'site-office-cabin-20ft-standard',
    productId: 'site-office-cabin-20ft',
    productName: 'Site Office Cabin 20ft',
    productSlug: 'site-office-cabin-20ft',
    sizeKey: 'standard',
    sizeLabel: '2.40m x 6.00m (Standard)',
    basePrice: 8500,
    quantity: 1,
    ...overrides,
  }
}

describe('revalidateQuoteItems', () => {
  it('accepts an unchanged submission and returns it validated against current Sanity data', () => {
    const result = revalidateQuoteItems([baseLine()], productsById(CABIN_PRODUCT))

    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error('expected ok result')
    expect(result.items).toEqual([
      expect.objectContaining({ basePrice: 8500, customTotal: 8500, isPoa: false }),
    ])
  })

  it('resolves fixed-pricing customizations onto the size price', () => {
    const line = baseLine({
      customTotal: 9800,
      selectedCustomizations: [
        {
          groupId: 'grp-electrical',
          groupTitle: 'Electrical Package',
          itemKey: 'upgraded-elec',
          optionTitle: 'Upgraded electrical package',
          price: 1300,
          isPoa: false,
          pricingType: 'fixed',
          priceSource: 'itemDefault',
        },
      ],
    })

    const result = revalidateQuoteItems([line], productsById(CABIN_PRODUCT))

    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error('expected ok result')
    expect(result.items[0]?.customTotal).toBe(9800)
    expect(result.items[0]?.selectedCustomizations?.[0]).toMatchObject({
      groupId: 'grp-electrical',
      itemKey: 'upgraded-elec',
      price: 1300,
      pricingType: 'fixed',
    })
  })

  it('resolves included-pricing customizations as £0 and never charges for them', () => {
    const line = baseLine({
      customTotal: 8500,
      selectedCustomizations: [
        {
          groupId: 'grp-electrical',
          groupTitle: 'Electrical Package',
          itemKey: 'standard-elec',
          optionTitle: 'Standard package',
          price: 0,
          isPoa: false,
          pricingType: 'included',
          priceSource: 'itemDefault',
        },
      ],
    })

    const result = revalidateQuoteItems([line], productsById(CABIN_PRODUCT))

    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error('expected ok result')
    expect(result.items[0]?.customTotal).toBe(8500)
  })

  it('treats a POA Size Option as £0 with hasPoa set, ignoring any client total', () => {
    const line = baseLine({
      id: 'blast-cabin-custom',
      productId: 'blast-cabin',
      productName: 'Bespoke Armoured Blast Cabin',
      productSlug: 'blast-cabin',
      sizeKey: 'custom',
      sizeLabel: 'Custom Spec',
      basePrice: 0,
      customTotal: 0,
      isPoa: true,
    })

    const result = revalidateQuoteItems([line], productsById(POA_PRODUCT))

    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error('expected ok result')
    expect(result.items[0]).toMatchObject({ isPoa: true, customTotal: 0 })
  })

  it('flags a size that has newly become POA as a price change rather than silently accepting it', () => {
    const line = baseLine({
      id: 'blast-cabin-custom',
      productId: 'blast-cabin',
      productName: 'Bespoke Armoured Blast Cabin',
      productSlug: 'blast-cabin',
      sizeKey: 'custom',
      sizeLabel: 'Custom Spec',
      basePrice: 12000,
      customTotal: 12000,
      isPoa: false,
    })

    const result = revalidateQuoteItems([line], productsById(POA_PRODUCT))

    expect(result.ok).toBe(false)
    if (result.ok) throw new Error('expected a blocked result')
    expect(result.reason).toBe('price_changed')
    expect(result.changes[0]).toMatchObject({ oldIsPoa: false, newIsPoa: true, newUnitPrice: 0 })
  })

  it('stops submission on a changed price and reports old and current ex-VAT values', () => {
    const line = baseLine({ basePrice: 7000, customTotal: 7000 })

    const result = revalidateQuoteItems([line], productsById(CABIN_PRODUCT))

    expect(result.ok).toBe(false)
    if (result.ok) throw new Error('expected a blocked result')
    expect(result.reason).toBe('price_changed')
    expect(result.changes).toEqual([
      expect.objectContaining({ lineId: line.id, oldUnitPrice: 7000, newUnitPrice: 8500 }),
    ])
  })

  it('lets the customer confirm a recalculated price, still deriving the stored value from Sanity', () => {
    const line = baseLine({ basePrice: 7000, customTotal: 7000 })

    const result = revalidateQuoteItems([line], productsById(CABIN_PRODUCT), { confirmedPrices: true })

    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error('expected ok result')
    // The stored/emailed price is the server's own £8,500, never the client's stale £7,000.
    expect(result.items[0]?.customTotal).toBe(8500)
  })

  it('rejects a tampered price even when the client claims confirmation', () => {
    const line = baseLine({ basePrice: 1, customTotal: 1 })

    const confirmed = revalidateQuoteItems([line], productsById(CABIN_PRODUCT), { confirmedPrices: true })

    expect(confirmed.ok).toBe(true)
    if (!confirmed.ok) throw new Error('expected ok result')
    // Confirmation can only ever unlock the server's own number — it cannot inject the client's.
    expect(confirmed.items[0]?.customTotal).toBe(8500)
    expect(confirmed.items[0]?.customTotal).not.toBe(1)
  })

  it('stops submission when the product no longer exists in Sanity', () => {
    const line = baseLine({ productId: 'deleted-product' })

    const result = revalidateQuoteItems([line], productsById(CABIN_PRODUCT))

    expect(result.ok).toBe(false)
    if (result.ok) throw new Error('expected a blocked result')
    expect(result.reason).toBe('unavailable')
    expect(result.issues).toEqual([
      expect.objectContaining({ lineId: line.id, reason: 'product_unavailable' }),
    ])
  })

  it('stops submission when the product has since been unpublished', () => {
    const draftProduct: SanityProduct = { ...CABIN_PRODUCT, status: 'draft' }
    const result = revalidateQuoteItems([baseLine()], productsById(draftProduct))

    expect(result.ok).toBe(false)
    if (result.ok) throw new Error('expected a blocked result')
    expect(result.reason).toBe('unavailable')
    expect(result.issues[0]?.reason).toBe('product_unavailable')
  })

  it('stops submission when the chosen Size Option no longer exists', () => {
    const line = baseLine({ sizeKey: 'removed-size' })
    const result = revalidateQuoteItems([line], productsById(CABIN_PRODUCT))

    expect(result.ok).toBe(false)
    if (result.ok) throw new Error('expected a blocked result')
    expect(result.reason).toBe('unavailable')
    expect(result.issues[0]?.reason).toBe('size_unavailable')
  })

  it('stops submission and identifies the line and selection when a customization item is no longer offered', () => {
    const line = baseLine({
      selectedCustomizations: [
        {
          groupId: 'grp-electrical',
          groupTitle: 'Electrical Package',
          itemKey: 'discontinued-elec',
          optionTitle: 'Discontinued electrical package',
          price: 1300,
          isPoa: false,
          pricingType: 'fixed',
        },
      ],
    })

    const result = revalidateQuoteItems([line], productsById(CABIN_PRODUCT))

    expect(result.ok).toBe(false)
    if (result.ok) throw new Error('expected a blocked result')
    expect(result.reason).toBe('unavailable')
    expect(result.issues).toEqual([
      expect.objectContaining({
        lineId: line.id,
        productName: 'Site Office Cabin 20ft',
        sizeLabel: '2.40m x 6.00m (Standard)',
        groupTitle: 'Electrical Package',
        optionTitle: 'Discontinued electrical package',
        reason: 'selection_unavailable',
      }),
    ])
  })

  it('never lets an unavailable selection through, even when the customer has confirmed prices', () => {
    const line = baseLine({
      selectedCustomizations: [
        {
          groupId: 'grp-electrical',
          groupTitle: 'Electrical Package',
          itemKey: 'discontinued-elec',
          optionTitle: 'Discontinued electrical package',
          price: 1300,
          isPoa: false,
        },
      ],
    })

    const result = revalidateQuoteItems([line], productsById(CABIN_PRODUCT), { confirmedPrices: true })

    expect(result.ok).toBe(false)
    if (result.ok) throw new Error('expected a blocked result')
    expect(result.reason).toBe('unavailable')
  })
})
