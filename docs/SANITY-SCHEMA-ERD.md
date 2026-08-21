# Sanity Schemas Architecture & ERD

This document outlines the content architecture, relations, and entity-relationship diagram for the Karmod International Sanity CMS.

## Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    CATEGORY ||--o{ CATEGORY : "parent / children"
    CATEGORY ||--o{ PRODUCT : "categorizes (many-to-many)"
    PRODUCT ||--|{ SIZE_OPTION : "embedded sizes (min 1, exactly 1 default)"
    SIZE_OPTION ||--|{ SIZE_IMAGE : "own renders (min 1, exactly 1 plan view)"
    PRODUCT ||--o{ CUSTOMIZATION_GROUP : "references groups"
    CUSTOMIZATION_GROUP ||--|{ CUSTOMIZATION_ITEM : "contains items"
    PRODUCT ||--o{ SPEC_ITEM : "specifications"
    QUOTE_ENQUIRY ||--|{ QUOTE_ITEM : "contains line items"
    QUOTE_ITEM }o--|| PRODUCT : "references product"

    CATEGORY {
        string name
        slug slug
        reference parent
        text description
        image image
        number displayOrder
        object seo
    }

    PRODUCT {
        string name
        slug slug
        string shortDescription
        array description_portableText
        array categories
        array lifestyleImages
        array sizes
        array customizationGroups
        array specifications
        boolean isFeatured
        string status
        object seo
    }

    CUSTOMIZATION_GROUP {
        string title
        string identifier
        string selectionType
        boolean isMandatory
        text description
        array items
    }

    CUSTOMIZATION_ITEM {
        string title
        string pricingType
        number price
        boolean requiresTextInput
        text description
        image image
    }

    SIZE_OPTION {
        string label
        number widthM
        number lengthM
        number heightM
        number weightKg
        boolean isPoa
        number price
        boolean isDefault
        array images
    }

    SIZE_IMAGE {
        string view
        string alt
        string caption
        image asset
    }

    SPEC_ITEM {
        string key
        string value
        string unit
    }

    SEO {
        string metaTitle
        text metaDescription
        image ogImage
    }

    QUOTE_ENQUIRY {
        string referenceNumber
        string status
        string customerName
        string email
        string phone
        string company
        string deliveryLocation
        text customerNotes
        array items
        number estimatedTotal
        boolean hasPoa
        text internalNotes
        datetime submittedAt
    }

    QUOTE_ITEM {
        reference product
        string productTitle
        string sizeLabel
        number quantity
        number unitPrice
        boolean isPoa
        array selectedCustomizations
        number subtotal
    }
```

## Schema Entities

### 1. `category` (Document)
- **Hierarchy**: Self-referencing `parent` field enables multi-level taxonomy (Top-level -> Subcategory -> Sub-subcategory).
- **Display Order**: Integer field for ordering in navigation and category lists.
- **SEO**: Page title & meta description override for category pages.

### 2. `product` (Document)
- **Multi-Category**: Can belong to multiple categories/subcategories.
- **Mandatory Sizes**: At least one `sizeOption` is required. Units are in meters (`widthM`, `lengthM`, `heightM`), frontend handles dual metric/imperial display.
- **Customizations**: References `customizationGroup` documents (Electricity, Heater, WC, Kitchen).
- **Rich Description**: Block content (Portable Text) supporting headers, bold/italic, lists, and links.
- **Specs**: Key-value pairs for technical specifications.

### 3. `customizationGroup` (Document)
- Reusable add-on groups (e.g., Electricity Options, Heater Options, Sanitation / WC, Kitchenette).
- `selectionType`: `'single'` (radio), `'multiple'` (checkbox), or `'boolean'` (toggle).
- `items`: Array of `customizationItem` objects.

### 4. `customizationItem` (Object)
- Choice within a group.
- `pricingType`:
  - `fixed`: Fixed additional price (£).
  - `included`: Standard / included at £0.
  - `poa`: Price on Application (triggers custom quote logic).
- `requiresTextInput`: Flag for user notes (e.g., custom electrical requirements).

### 5. `sizeOption` (Object)
- Metric dimensions (`widthM`, `lengthM`, `heightM`) and `weightKg`.
- `isPoa`: when true the size has no published price — `price` is hidden in the Studio and the UI shows "POA" rather than a figure.
- `weightKg`: `0` is the agreed sentinel for **weight not yet supplied**. It does not mean weightless, and must not be rendered as "0 kg".
- `isDefault`: exactly one size per product must be the default. Card thumbnails resolve through it.
- `images[]`: the renders for **this size only** (min 1). Every render depicts one particular size, so a product-level gallery no longer exists — an editor cannot attach an image except to a size.
  - Each render carries a `view` from a closed vocabulary: `front`, `left-diagonal`, `right-diagonal`, `right`, `back`, `interior`, `door`, `top`.
  - Exactly one render per size must be the `top` (plan) view — this replaces the old `floorPlanImage` field, so no second field can disagree about which image is the plan.
  - Each render's array `_key` is its view name; Sanity enforces `_key` uniqueness, making duplicate views structurally impossible.
  - Vocabulary and validators live in `sanity/schemas/objects/productImageViews.ts`.

### 5a. `product.lifestyleImages` (Object array)
- Optional, size-agnostic photography only — installed units in context. Named so it cannot quietly become a size gallery again.

### 6. `quoteEnquiry` (Document - Lead CRM)
- Stored directly in Sanity when visitors submit the quote form.
- `status`: `'new'` (unread) ➔ `'in_progress'` (contacted) ➔ `'quote_sent'` ➔ `'won'` ➔ `'lost'`.
- `internalNotes`: Internal followup and negotiation notes for the Karmod sales team.
