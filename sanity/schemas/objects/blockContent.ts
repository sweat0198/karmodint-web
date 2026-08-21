import { defineType, defineArrayMember } from 'sanity'
import {
  BLOCK_CONTENT_DECORATORS,
  BLOCK_CONTENT_LINK_ANNOTATION,
  BLOCK_CONTENT_LISTS,
  BLOCK_CONTENT_STYLES
} from './blockContentSpec'

export const blockContent = defineType({
  title: 'Block Content',
  name: 'blockContent',
  type: 'array',
  of: [
    defineArrayMember({
      title: 'Block',
      type: 'block',
      // Styles, lists and decorators come from the shared whitelist so the catalogue import's
      // markdown conversion is held to exactly what an editor can type here.
      styles: BLOCK_CONTENT_STYLES,
      lists: BLOCK_CONTENT_LISTS,
      marks: {
        decorators: BLOCK_CONTENT_DECORATORS,
        annotations: [
          {
            title: BLOCK_CONTENT_LINK_ANNOTATION.title,
            name: BLOCK_CONTENT_LINK_ANNOTATION.name,
            type: 'object',
            fields: [
              {
                title: 'URL',
                name: BLOCK_CONTENT_LINK_ANNOTATION.hrefField,
                type: 'url',
                validation: (Rule) =>
                  Rule.uri({
                    scheme: ['http', 'https', 'mailto', 'tel']
                  })
              }
            ]
          }
        ]
      }
    }),
    defineArrayMember({
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          description: 'Important for SEO and accessibility.',
          validation: (Rule) => Rule.required()
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption'
        }
      ]
    })
  ]
})
