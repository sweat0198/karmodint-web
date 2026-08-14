import { defineType, defineField } from 'sanity'

export const specItem = defineType({
  name: 'specItem',
  title: 'Specification Item',
  type: 'object',
  fields: [
    defineField({
      name: 'key',
      title: 'Feature / Specification Name',
      type: 'string',
      description: 'e.g. "Wall Insulation", "Chassis Frame", "Glazing", "Fire Rating"',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'value',
      title: 'Specification Value',
      type: 'string',
      description: 'e.g. "50mm EPS Sandwich Panel", "Galvanized Steel", "Double Glazed PVC"',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'group',
      title: 'Specification Group',
      type: 'string',
      description: 'Optional group heading, e.g. "Structure", "Thermal", "Electrical", "Finishes"',
      options: {
        list: [
          { title: 'Structure & Frame', value: 'structure' },
          { title: 'Thermal & Insulation', value: 'thermal' },
          { title: 'Doors & Windows', value: 'openings' },
          { title: 'Electrical & Plumbing', value: 'services' },
          { title: 'Flooring & Finishes', value: 'finishes' },
          { title: 'General / Standards', value: 'general' }
        ]
      }
    })
  ],
  preview: {
    select: {
      key: 'key',
      value: 'value',
      group: 'group'
    },
    prepare({ key, value, group }) {
      return {
        title: key || 'Unnamed Spec',
        subtitle: group ? `[${group}] ${value || ''}` : value || ''
      }
    }
  }
})
