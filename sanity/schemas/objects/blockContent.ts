import { defineType, defineArrayMember } from 'sanity'
import {
  BLOCK_CONTENT_DECORATORS,
  BLOCK_CONTENT_LINK_ANNOTATION,
  BLOCK_CONTENT_LISTS,
  BLOCK_CONTENT_STYLES
} from './blockContentSpec'

/**
 * The link annotation, shared with every other Portable Text field (e.g. a FAQ answer).
 *
 * Relative hrefs are allowed so ported Legacy copy can link a sibling page as `/portable-cabin/`
 * (ADR-003) rather than hard-coding the www origin, which would break links on pages.dev previews.
 */
export const blockContentLinkAnnotation = defineArrayMember({
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
          scheme: ['http', 'https', 'mailto', 'tel'],
          allowRelative: true
        })
    }
  ]
})

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
        annotations: [blockContentLinkAnnotation]
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
