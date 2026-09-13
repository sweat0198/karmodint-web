import { defineArrayMember, defineField, defineType } from 'sanity'

export function validateItemOverrides(
  overrides: Array<{ itemKey?: string }> | undefined,
): true | string {
  if (!overrides) return true

  const seen = new Set<string>()
  for (const override of overrides) {
    if (!override.itemKey) continue
    if (seen.has(override.itemKey)) {
      return `Customization Item "${override.itemKey}" can have only one override`
    }
    seen.add(override.itemKey)
  }

  return true
}

export function validateItemOverrideKeys(
  overrides: Array<{ itemKey?: string }> | undefined,
  itemKeys: string[],
): true | string {
  const itemKeySet = new Set(itemKeys)
  const invalidKey = overrides?.find((override) => override.itemKey && !itemKeySet.has(override.itemKey))?.itemKey
  return invalidKey
    ? `Customization Item "${invalidKey}" does not exist in the selected Customization Group`
    : true
}

/** Product-specific controls for one reusable Customization Group. */
export const productCustomizationConfiguration = defineType({
  name: 'productCustomizationConfiguration',
  title: 'Product Customization Configuration',
  type: 'object',
  fields: [
    defineField({
      name: 'group',
      title: 'Customization Group',
      type: 'reference',
      to: [{ type: 'customizationGroup' }],
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'itemOverrides',
      title: 'Item Overrides',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'productCustomizationItemOverride',
          title: 'Item Override',
          type: 'object',
          fields: [
            defineField({
              name: 'itemKey',
              title: 'Customization Item Key',
              type: 'string',
              validation: (Rule) => Rule.required()
            }),
            defineField({
              name: 'enabled',
              title: 'Available for This Product',
              type: 'boolean',
              initialValue: true
            }),
            defineField({
              name: 'pricingType',
              title: 'Pricing Type Override',
              type: 'string',
              options: {
                list: [
                  { title: 'Fixed Additional Price (£)', value: 'fixed' },
                  { title: 'Included / Standard (£0)', value: 'included' },
                  { title: 'POA / Custom Quote Required', value: 'poa' }
                ],
                layout: 'radio'
              }
            }),
            defineField({
              name: 'price',
              title: 'Price Override (£)',
              type: 'number',
              hidden: ({ parent }) => parent?.pricingType !== 'fixed',
              validation: (Rule) => Rule.min(0)
            })
          ]
        })
      ],
      validation: (Rule) => Rule.custom(validateItemOverrides)
    })
  ],
  validation: (Rule) => Rule.custom(async (configuration: {
    group?: { _ref?: string }
    itemOverrides?: Array<{ itemKey?: string }>
  } | undefined, context: any) => {
    const groupId = configuration?.group?._ref
    if (!groupId || !configuration?.itemOverrides?.length) return true

    const itemKeys = await context
      .getClient({ apiVersion: '2025-02-19' })
      .withConfig({ perspective: 'drafts' })
      .fetch<string[]>('*[_id == $groupId][0].items[]._key', { groupId })

    return validateItemOverrideKeys(configuration.itemOverrides, itemKeys ?? [])
  }),
  preview: {
    select: { title: 'group.title', overrideCount: 'itemOverrides.length' },
    prepare({ title, overrideCount }) {
      return {
        title: title || 'Select a customization group',
        subtitle: `${overrideCount || 0} item override${overrideCount === 1 ? '' : 's'}`
      }
    }
  }
})
