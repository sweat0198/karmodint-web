# Domain Glossary & Context - Karmod International

This document defines the key domain terminology for Karmod International's web application.

## Core Products & Categories

- **Portable Cabin**: Prefabricated standalone space units used for temporary offices, accommodation, or storage.
- **Kiosk**: Compact prefabricated structures designed for retail, ticketing, or food/beverage service.
- **Gatehouse**: Security control cabins positioned at facility entrances or site perimeters.
- **Ticket Booth**: Dedicated small kiosks configured specifically for entry control and ticket sales.
- **Modular Building**: Multi-unit prefabricated structures combined to form larger office complexes or accommodation facilities.

## Key Technical Concepts

- **Quote List**: A client-side shopping bag holding chosen products and variant options prior to sending a formal enquiry. (No instant checkout or online payment).
- **Variant Modifier**: Options for a base product (e.g. Dimensions, Insulation spec, Exterior color, Window options) that may adjust indicative base pricing.
- **Enquiry Submission**: The action of sending the complete quote list alongside visitor contact info (Name, Email, Phone) to Karmod sales staff via Resend email API.
- **Static Generation (SSG)**: Pre-rendering static HTML pages from Sanity CMS data at build time.

## Catalogue Structure

- **Size Option**: One purchasable size of a product, carrying its own dimensions, weight, price and renders. Products are never sold as a single size — every product has at least one, and exactly one is the **default**.
- **Default Size**: The size pre-selected on the product page. Exactly one per product; card thumbnails resolve their image through it.
- **View**: Which elevation a render depicts, drawn from a closed vocabulary — `front`, `left-diagonal`, `right-diagonal`, `right`, `back`, `interior`, `door`, `top`. Renders belong to a **size**, not to a product, because every render depicts one particular size.
- **Plan View** (`top`): The top-down drawing of a size. Exactly one per size — it replaces the former separate "floor plan" field, so nothing can disagree about which image is the plan.
- **POA (Price on Application)**: No published price for this size; the UI shows "POA" rather than a figure. The stored `price` is a placeholder and must be excluded from "from £x" calculations, or cards will advertise "From £0".
- **Unsupplied Weight (`weightKg: 0`)**: `0` means **weight not yet supplied**, NOT a weightless unit. Rendered naively it reads as "0 kg" on a live page. Anything displaying weight must handle the sentinel explicitly.
- **Lifestyle Image**: Size-agnostic product photography (installed units in context). Distinct from size renders, and deliberately named so it cannot quietly become a per-size gallery.
