import { defineType, defineField, defineArrayMember } from 'sanity'

export const quoteEnquiryType = defineType({
  name: 'quoteEnquiry',
  title: 'Quote Enquiry',
  type: 'document',
  fields: [
    defineField({
      name: 'referenceNumber',
      title: 'Enquiry Reference',
      type: 'string',
      readOnly: true,
      description: 'System generated lead reference number'
    }),
    defineField({
      name: 'status',
      title: 'Lead Status',
      type: 'string',
      options: {
        list: [
          { title: '🔴 New Lead (Unread)', value: 'new' },
          { title: '🟡 In Progress / Contacted', value: 'in_progress' },
          { title: '🔵 Formal Quote Sent', value: 'quote_sent' },
          { title: '🟢 Won / Deal Closed', value: 'won' },
          { title: '⚫ Lost / Cancelled', value: 'lost' }
        ],
        layout: 'radio'
      },
      initialValue: 'new',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'customerName',
      title: 'Customer Name',
      type: 'string',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'email',
      title: 'Email Address',
      type: 'string',
      validation: (Rule) => Rule.required().email()
    }),
    defineField({
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'company',
      title: 'Company / Organization',
      type: 'string'
    }),
    defineField({
      name: 'deliveryLocation',
      title: 'Delivery Postcode / Town',
      type: 'string'
    }),
    defineField({
      name: 'customerNotes',
      title: 'Customer Notes & Requirements',
      type: 'text',
      rows: 3
    }),
    defineField({
      name: 'items',
      title: 'Requested Products & Customizations',
      type: 'array',
      of: [defineArrayMember({ type: 'quoteItem' })],
      validation: (Rule) => Rule.required().min(1)
    }),
    defineField({
      name: 'estimatedTotal',
      title: 'Estimated Total (£)',
      type: 'number',
      description: 'Indicative total calculated from fixed options at submission'
    }),
    defineField({
      name: 'hasPoa',
      title: 'Contains Custom Quote Items (POA)',
      type: 'boolean',
      initialValue: false
    }),
    defineField({
      name: 'internalNotes',
      title: 'Sales Team Internal Notes',
      type: 'text',
      rows: 4,
      description: 'Internal logs, callback dates, negotiated pricing, and customer follow-up notes.'
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submission Date & Time',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    })
  ],
  orderings: [
    {
      title: 'Submitted (Newest First)',
      name: 'submittedAtDesc',
      by: [{ field: 'submittedAt', direction: 'desc' }]
    },
    {
      title: 'Status',
      name: 'statusAsc',
      by: [{ field: 'status', direction: 'asc' }]
    }
  ],
  preview: {
    select: {
      ref: 'referenceNumber',
      name: 'customerName',
      company: 'company',
      status: 'status',
      total: 'estimatedTotal',
      hasPoa: 'hasPoa',
      date: 'submittedAt'
    },
    prepare({ ref, name, company, status, total, hasPoa, date }) {
      const statusIcons: Record<string, string> = {
        new: '🔴 NEW',
        in_progress: '🟡 CONTACTED',
        quote_sent: '🔵 QUOTED',
        won: '🟢 WON',
        lost: '⚫ LOST'
      }

      const statusBadge = statusIcons[status || 'new'] || status
      const companyLabel = company ? ` (${company})` : ''
      const priceStr = hasPoa ? `£${total?.toLocaleString() || 0} + POA` : `£${total?.toLocaleString() || 0}`
      const formattedDate = date ? new Date(date).toLocaleDateString('en-GB') : ''

      return {
        title: `${name || 'Unknown'}${companyLabel} • ${statusBadge}`,
        subtitle: `${ref ? `[${ref}] ` : ''}${priceStr} • ${formattedDate}`
      }
    }
  }
})

export default quoteEnquiryType
