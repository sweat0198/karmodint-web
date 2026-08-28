import type { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Karmod Content & Sales Studio')
    .items([
      // Quote Enquiries (CRM Leads) Section
      S.listItem()
        .title('Quote Enquiries (Leads)')
        .child(
          S.list()
            .title('Lead Management')
            .items([
              S.listItem()
                .title('🔴 New Enquiries (Unread)')
                .child(
                  S.documentList()
                    .title('New Enquiries')
                    .filter('_type == "quoteEnquiry" && status == "new"')
                    .defaultOrdering([{ field: 'submittedAt', direction: 'desc' }])
                ),
              S.listItem()
                .title('🟡 In Progress / Contacted')
                .child(
                  S.documentList()
                    .title('In Progress')
                    .filter('_type == "quoteEnquiry" && status == "in_progress"')
                    .defaultOrdering([{ field: 'submittedAt', direction: 'desc' }])
                ),
              S.listItem()
                .title('🔵 Formal Quotes Sent')
                .child(
                  S.documentList()
                    .title('Quotes Sent')
                    .filter('_type == "quoteEnquiry" && status == "quote_sent"')
                    .defaultOrdering([{ field: 'submittedAt', direction: 'desc' }])
                ),
              S.listItem()
                .title('🟢 Won Deals')
                .child(
                  S.documentList()
                    .title('Won Deals')
                    .filter('_type == "quoteEnquiry" && status == "won"')
                    .defaultOrdering([{ field: 'submittedAt', direction: 'desc' }])
                ),
              S.divider(),
              S.listItem()
                .title('📋 All Enquiries')
                .child(
                  S.documentTypeList('quoteEnquiry')
                    .title('All Enquiries')
                    .defaultOrdering([{ field: 'submittedAt', direction: 'desc' }])
                )
            ])
        ),

      S.divider(),

      // Products Section
      S.listItem()
        .title('Products')
        .child(
          S.list()
            .title('Product Directory')
            .items([
              S.listItem()
                .title('All Products')
                .child(S.documentTypeList('product').title('All Products')),
              S.listItem()
                .title('Featured Products')
                .child(
                  S.documentList()
                    .title('Featured Products')
                    .filter('_type == "product" && isFeatured == true')
                ),
              S.listItem()
                .title('Products by Category')
                .child(
                  S.documentTypeList('category')
                    .title('Select Category')
                    .child((categoryId) =>
                      S.documentList()
                        .title('Products')
                        .filter('_type == "product" && $categoryId in categories[]._ref')
                        .params({ categoryId })
                    )
                )
            ])
        ),

      S.divider(),

      // Categories Section
      S.listItem()
        .title('Categories')
        .child(
          S.list()
            .title('Category Structure')
            .items([
              S.listItem()
                .title('All Categories')
                .child(
                  S.documentTypeList('category')
                    .title('All Categories')
                    .defaultOrdering([{ field: 'displayOrder', direction: 'asc' }])
                ),
              S.listItem()
                .title('Top-Level Categories')
                .child(
                  S.documentList()
                    .title('Top-Level Categories')
                    .filter('_type == "category" && !defined(parent)')
                    .defaultOrdering([{ field: 'displayOrder', direction: 'asc' }])
                ),
              S.listItem()
                .title('Subcategories')
                .child(
                  S.documentList()
                    .title('Subcategories')
                    .filter('_type == "category" && defined(parent)')
                    .defaultOrdering([{ field: 'displayOrder', direction: 'asc' }])
                )
            ])
        ),

      S.divider(),

      // References Section
      S.listItem()
        .title('References')
        .child(
          S.documentTypeList('clientReference')
            .title('References')
            .defaultOrdering([
              { field: 'displayOrder', direction: 'asc' },
              { field: 'companyName', direction: 'asc' }
            ])
        ),

      S.divider(),

      // Customizations Section
      S.listItem()
        .title('Customizations & Add-ons')
        .child(
          S.documentTypeList('customizationGroup')
            .title('Customization Groups')
            .defaultOrdering([{ field: 'displayOrder', direction: 'asc' }])
        )
    ])
