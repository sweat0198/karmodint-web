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

export function validateSizeRuleKeys(
  rules: Array<{ sizeOptionKey?: string }> | undefined,
): true | string {
  if (!rules) return true

  const seen = new Set<string>()
  for (const rule of rules) {
    if (!rule.sizeOptionKey) continue
    if (seen.has(rule.sizeOptionKey)) {
      return `Size Option "${rule.sizeOptionKey}" can have only one rule for this Customization Item`
    }
    seen.add(rule.sizeOptionKey)
  }

  return true
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
            }),
            defineField({
              name: 'titleOverride',
              title: 'Title Override',
              type: 'string',
              description: 'Optional Product-specific customer-facing title.'
            }),
            defineField({
              name: 'descriptionOverride',
              title: 'Description Override',
              type: 'text',
              rows: 2,
              description: 'Optional Product-specific customer-facing description.'
            }),
            defineField({
              name: 'sizeRules',
              title: 'Size Option Rules',
              type: 'array',
              description: 'Override this item for a specific Product Size Option. Each rule needs review before a published product can use it.',
              of: [
                defineArrayMember({
                  name: 'productCustomizationSizeRule',
                  title: 'Size Option Rule',
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'sizeOptionKey',
                      title: 'Size Option Key',
                      type: 'string',
                      description: 'Enter the stable _key shown on the matching Product > Size Options entry. Publish validation lists valid keys and labels.',
                      validation: (Rule) => Rule.required()
                    }),
                    defineField({
                      name: 'mode',
                      title: 'Availability & Pricing',
                      type: 'string',
                      options: {
                        list: [
                          { title: 'Inherit Product / Item default', value: 'inherit' },
                          { title: 'Fixed Additional Price (£)', value: 'fixed' },
                          { title: 'Included / Standard (£0)', value: 'included' },
                          { title: 'POA / Custom Quote Required', value: 'poa' },
                          { title: 'Unavailable for this size', value: 'unavailable' }
                        ],
                        layout: 'radio'
                      },
                      initialValue: 'inherit',
                      validation: (Rule) => Rule.required()
                    }),
                    defineField({
                      name: 'price',
                      title: 'Fixed Additional Price (£)',
                      type: 'number',
                      hidden: ({ parent }) => parent?.mode !== 'fixed',
                      validation: (Rule) => Rule.custom((value, context: any) => {
                        if (context.parent?.mode === 'fixed' && (value === undefined || value === null)) {
                          return 'Price is required for a fixed Size Option rule'
                        }
                        if (value !== undefined && value !== null && value < 0) {
                          return 'Price cannot be negative'
                        }
                        return true
                      })
                    }),
                    defineField({
                      name: 'titleOverride',
                      title: 'Title Override',
                      type: 'string'
                    }),
                    defineField({
                      name: 'descriptionOverride',
                      title: 'Description Override',
                      type: 'text',
                      rows: 2
                    }),
                    defineField({
                      name: 'review',
                      title: 'Review',
                      type: 'object',
                      fields: [
                        defineField({
                          name: 'status',
                          title: 'Review Status',
                          type: 'string',
                          options: {
                            list: [
                              { title: 'Pending review', value: 'pending' },
                              { title: 'Reviewed', value: 'reviewed' }
                            ],
                            layout: 'radio'
                          },
                          initialValue: 'pending',
                          validation: (Rule) => Rule.required()
                        }),
                        defineField({
                          name: 'snapshot',
                          title: 'Reviewed Size Snapshot',
                          type: 'string',
                          description: 'Record the exact review snapshot: size key, length, width, height, mode, price, title override, and description override. Re-review after any of these values changes.',
                          validation: (Rule) => Rule.required()
                        })
                      ]
                    })
                  ]
                })
              ],
              validation: (Rule) => Rule.custom(validateSizeRuleKeys)
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
