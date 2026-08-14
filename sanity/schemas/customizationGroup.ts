import { defineType, defineField, defineArrayMember } from 'sanity'

export const customizationGroupType = defineType({
  name: 'customizationGroup',
  title: 'Customization Group',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Group Title',
      type: 'string',
      description: 'e.g. "Electricity Options", "Heater Option", "WC & Sanitation", "Kitchenette"',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'identifier',
      title: 'Unique Key / Code',
      type: 'slug',
      options: { source: 'title', maxLength: 50 },
      description: 'e.g. "electricity", "heater", "wc", "kitchen"',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'selectionType',
      title: 'Selection Mode',
      type: 'string',
      options: {
        list: [
          { title: 'Single Choice (Radio / Dropdown - pick 1)', value: 'single' },
          { title: 'Multiple Choice (Checkboxes - pick any)', value: 'multiple' },
          { title: 'Optional Toggle (Add-on on/off)', value: 'boolean' }
        ],
        layout: 'radio'
      },
      initialValue: 'single',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'isMandatory',
      title: 'Mandatory Selection?',
      type: 'boolean',
      description: 'If true, user MUST pick an option from this group before submitting quote.',
      initialValue: false
    }),
    defineField({
      name: 'description',
      title: 'Description / Helper Note',
      type: 'text',
      rows: 2,
      description: 'Help text displayed to customer above the option selector.'
    }),
    defineField({
      name: 'items',
      title: 'Option Choices',
      type: 'array',
      of: [defineArrayMember({ type: 'customizationItem' })],
      description: 'The selectable items in this group (e.g. 1 light 2 socket, 2 light 4 socket, Customised electricity)',
      validation: (Rule) => Rule.required().min(1)
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display Order',
      type: 'number',
      description: 'Order in configurator UI (e.g. 1 for Electricity, 2 for Heater, etc.)',
      initialValue: 10
    })
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'displayOrderAsc',
      by: [{ field: 'displayOrder', direction: 'asc' }]
    }
  ],
  preview: {
    select: {
      title: 'title',
      identifier: 'identifier.current',
      itemCount: 'items.length',
      selectionType: 'selectionType'
    },
    prepare({ title, identifier, itemCount, selectionType }) {
      const countLabel = itemCount ? `${itemCount} choice${itemCount > 1 ? 's' : ''}` : '0 choices'
      return {
        title: title || 'Unnamed Group',
        subtitle: `[${identifier || 'no-key'}] (${selectionType}) • ${countLabel}`
      }
    }
  }
})

export default customizationGroupType
