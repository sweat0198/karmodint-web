import { defineType, defineField } from 'sanity'

export const seo = defineType({
  name: 'seo',
  title: 'SEO & Social Sharing',
  type: 'object',
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Meta Title',
      type: 'string',
      description: 'Optimal length: 50-60 characters. If empty, document name will be used.',
      validation: (Rule) => Rule.max(70).warning('Title longer than 70 characters may be truncated on Google.')
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
      description: 'Optimal length: 140-160 characters for search engine snippets.',
      validation: (Rule) => Rule.max(180).warning('Description longer than 180 characters may be truncated.')
    }),
    defineField({
      name: 'ogImage',
      title: 'Social Share Image (OpenGraph)',
      type: 'image',
      description: 'Image displayed when link is shared on WhatsApp, LinkedIn, Twitter/X, etc.',
      options: { hotspot: true }
    }),
    defineField({
      name: 'noIndex',
      title: 'Hide from search engines (noindex)',
      type: 'boolean',
      initialValue: false,
      description: 'Enable to prevent Google from indexing this page'
    })
  ]
})
