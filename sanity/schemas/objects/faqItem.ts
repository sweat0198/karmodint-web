import { defineArrayMember, defineField, defineType } from 'sanity'
import { blockContentLinkAnnotation } from './blockContent'
import { BLOCK_CONTENT_DECORATORS, BLOCK_CONTENT_LISTS } from './blockContentSpec'

/**
 * One question and its answer, shared by every page type that carries FAQs (Product Lines,
 * Solutions).
 *
 * The page renders the visible accordion and the FAQPage structured data from this same entry, so
 * the two can never disagree. The answer is Portable Text rather than a plain string because
 * Legacy answers carry bold lead-ins and bullet lists; headings and images are left out, since an
 * answer is one short passage inside an accordion panel.
 */
export const faqItem = defineType({
  name: 'faqItem',
  title: 'FAQ',
  type: 'object',
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{ title: 'Normal', value: 'normal' }],
          lists: BLOCK_CONTENT_LISTS,
          marks: {
            decorators: BLOCK_CONTENT_DECORATORS,
            annotations: [blockContentLinkAnnotation]
          }
        })
      ],
      validation: (Rule) => Rule.required().min(1)
    })
  ],
  preview: {
    select: { title: 'question' }
  }
})

export default faqItem
