# UK modular-building competitor solution taxonomy

Research date/access date: **2026-09-16**  
Scope: UK-market manufacturers and suppliers of modular, prefabricated, portable and off-site buildings, weighted toward commercial, education and construction-site accommodation.  
Sample: **12 companies**. This is a purposive competitive sample, not a market-share ranking.

## Executive findings

- Competitors normally separate **sector navigation** from **building-use navigation**. Sector labels include Education, Healthcare, Construction/Infrastructure, Commercial/Industrial, Defence and Leisure. Building-use labels include Classroom, Site Office, Canteen, Toilet/Shower, Gatehouse, Storage, Retail Kiosk and Accommodation.
- **Education** and **welfare/canteen** appear explicitly at all 12 companies. These are the strongest anchors for a Karmod Solutions page.
- **Healthcare** appears at 11/12; **site office**, **sanitation** and **storage** also appear at 11/12. These are mature, expected solution families.
- **Accommodation** appears at 10/12. Competitors split it into student, workforce/sleeper, social/transitional, defence living and residential/lodge uses.
- **Retail/ticket/information** appears at 10/12. Frequent subtypes: kiosk, shop, marketing suite, ticket booth, visitor centre and drive-through.
- **Security gatehouse/access control** appears at 8/12. The leading language is Gatehouse, Security Lodge, Security Unit, CCTV Building, Site Access or Safety & Security Centre.
- **Garden room/office** is rare in this B2B-oriented sample: 1/12 has an explicit garden-building proposition. It should not drive the main commercial taxonomy.
- **Hire/rent/lease is explicit for 10/12** when public procurement routes are included. Most large suppliers pair rental flexibility with permanent purchase and turnkey delivery.
- Recommendation inferred from evidence: build a two-level IA. Top level by customer problem/sector; second level by concrete building use. Avoid mixing broad sectors and room types in one flat list.

## Method

1. Used current, first-party company websites and company-hosted brochures/case studies as primary evidence.
2. Counted a normalized tag as `1` only when an official source explicitly named the use, product or directly evidenced it in a first-party project. No SEO-snippet-only or third-party inference was counted.
3. Short official labels below preserve website wording. Strategic interpretations are separately marked **Inference**.
4. Binary definitions:
   - `site_office`: site/project/construction office, not a generic commercial office alone.
   - `welfare_canteen`: welfare, mess, dining, canteen or catering space.
   - `sanitation`: toilets/WCs, showers, washrooms or a delivered changing/hygiene facility.
   - `storage`: stores, storage container/room or explicit equipment/kit storage.
   - `security_gatehouse`: gatehouse, security lodge/booth/unit, CCTV building or access-control/security centre.
   - `retail_ticket_info`: retail unit, shop, kiosk, ticket booth, marketing suite or visitor/information centre.
   - `education`, `healthcare`, `accommodation`: explicit named sector/use.
   - `garden_room_office`: explicit garden building/room/office proposition; generic office does not qualify.
   - `high_security_industrial`: explicit anti-vandal, blast-resistant, defence/custodial/high-security or security-critical industrial/operational facility.

## Quantified category comparison

| Normalized theme | Companies | Share |
|---|---:|---:|
| welfare_canteen | 12 | 100.0% |
| education | 12 | 100.0% |
| site_office | 11 | 91.7% |
| sanitation | 11 | 91.7% |
| storage | 11 | 91.7% |
| healthcare | 11 | 91.7% |
| accommodation | 10 | 83.3% |
| retail_ticket_info | 10 | 83.3% |
| high_security_industrial | 9 | 75.0% |
| security_gatehouse | 8 | 66.7% |
| garden_room_office | 1 | 8.3% |

```text
welfare_canteen          12/12  ████████████  100%
education                12/12  ████████████  100%
site_office              11/12  ███████████░   92%
sanitation               11/12  ███████████░   92%
storage                  11/12  ███████████░   92%
healthcare               11/12  ███████████░   92%
accommodation            10/12  ██████████░░   83%
retail_ticket_info       10/12  ██████████░░   83%
high_security_industrial  9/12  █████████░░░   75%
security_gatehouse        8/12  ████████░░░░   67%
garden_room_office        1/12  █░░░░░░░░░░░    8%
```

## CSV-ready normalized matrix

`1` = explicit first-party evidence; `0` = not found in reviewed first-party evidence. A zero does not prove the supplier cannot build it.

| company | site_office | welfare_canteen | sanitation | storage | security_gatehouse | retail_ticket_info | education | healthcare | accommodation | garden_room_office | high_security_industrial |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Portakabin | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 0 | 1 |
| Wernick Group | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 0 | 1 |
| Algeco UK | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 0 | 1 |
| Premier Modular | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 0 | 1 |
| Thurston Group | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 0 | 1 |
| Modulek | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 0 | 1 |
| TG Escapes | 0 | 1 | 1 | 1 | 0 | 0 | 1 | 1 | 0 | 1 | 0 |
| Integra Buildings | 1 | 1 | 1 | 0 | 0 | 1 | 1 | 1 | 1 | 0 | 1 |
| Actiform | 1 | 1 | 0 | 1 | 1 | 1 | 1 | 1 | 1 | 0 | 1 |
| Cotaplan | 1 | 1 | 1 | 1 | 0 | 1 | 1 | 1 | 1 | 0 | 0 |
| Explore Modular | 1 | 1 | 1 | 1 | 0 | 0 | 1 | 1 | 1 | 0 | 0 |
| Cleveland Sitesafe | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 0 | 0 | 0 | 1 |

Raw CSV block:

```csv
company,site_office,welfare_canteen,sanitation,storage,security_gatehouse,retail_ticket_info,education,healthcare,accommodation,garden_room_office,high_security_industrial
Portakabin,1,1,1,1,1,1,1,1,1,0,1
Wernick Group,1,1,1,1,1,1,1,1,1,0,1
Algeco UK,1,1,1,1,1,1,1,1,1,0,1
Premier Modular,1,1,1,1,1,1,1,1,1,0,1
Thurston Group,1,1,1,1,1,1,1,1,1,0,1
Modulek,1,1,1,1,1,1,1,1,1,0,1
TG Escapes,0,1,1,1,0,0,1,1,0,1,0
Integra Buildings,1,1,1,0,0,1,1,1,1,0,1
Actiform,1,1,0,1,1,1,1,1,1,0,1
Cotaplan,1,1,1,1,0,1,1,1,1,0,0
Explore Modular,1,1,1,1,0,0,1,1,1,0,0
Cleveland Sitesafe,1,1,1,1,1,1,1,0,0,0,1
```

## Competitor detail

### 1. Portakabin

- **UK-market evidence:** GB-specific website; states UK-wide hire/buy availability and UK leadership; UK education, NHS and commercial case studies.
- **Official sector/solution labels:** Education Facilities; Site Accommodation; Health Facilities; Offices; Storage Facilities; Toilets, Showers and Changing Facilities; Hospitality; Retail; Professional and Amateur Sports and Training Facilities; Tourism and Leisure; Transitional Housing.
- **Named building uses:** classrooms, SEND classrooms, nurseries, laboratories, lecture theatres, dining halls, staff rooms, sports halls, site offices, canteens/mess rooms, changing/drying rooms, toilets/showers, secure storage, gatehouses, community centres, fitness/dance studios, locker rooms, marketing suites, retail units, production spaces, research and development, wards, operating theatres, pharmacies and waiting rooms.
- **Product families:** Duplex, Titan Building System, Ultima, Alta; Pacemaker/Titan ready-for-hire ranges; Konstructa site accommodation; Portaloo sanitary range.
- **Delivery model:** buy, hire or refurbished/pre-owned; temporary or permanent-grade; off-site manufacture, delivery and crane installation; planning/groundworks/furniture available through a one-stop-shop model.
- **Notable evidence:** Portakabin says large modular projects can be delivered up to 70% faster than conventional construction; modular buildings are described as having a 60-year design life and 30-year structural warranty.
- **Inference:** strongest benchmark for deep use-case navigation. Its sitemap exposes sector pages and granular rooms/functions separately.
- **Sources:** [UK home](https://www.portakabin.com/gb-en/); [modular buildings](https://www.portakabin.com/gb-en/buildings/our-product-range/modular-buildings/); [education uses](https://www.portakabin.com/gb-en/solutions/education-facilities); [site-wide solution taxonomy](https://www.portakabin.com/gb-en/sitemap/); [hire range](https://www.portakabin.com/gb-en/our-buildings/ready-for-hire/); [buying](https://www.portakabin.com/gb-en/how-we-work/procurement-options/buy/).

### 2. Wernick Group

- **UK-market evidence:** official site describes a national UK network with 45 depots/divisional offices and permanent, temporary, hire and sale divisions.
- **Official sector/solution labels:** Healthcare; Education & Childcare; Leisure; Office & Retail; Offices & Welfare; Emergency Accommodation; Modular Site Accommodation; Welfare Facilities; Storage and Containers.
- **Named building uses:** classrooms, teaching blocks, exam spaces, specialist learning areas, offices, decant space, canteens, welfare blocks, clinics, GP surgeries, wards, laboratories, outpatient facilities, gatehouses/security lodges, ticket booths, weighbridge offices, changing/drying rooms, toilets/showers, secure storage, sleeping accommodation and marketing suites.
- **Product families:** modular building hire; modular site systems including PSflex/AVflex/FMflex; portable cabins; GreenSpace welfare; RestPod sleeping units; anti-vandal, fire-rated and blast-resistant buildings; refurbished/ex-hire buildings.
- **Delivery model:** hire or purchase; new or refurbished; permanent or temporary; turnkey design through handover; UK depot support.
- **Notable evidence:** the gatehouse product is explicitly positioned for security lodges, ticket booths, weighbridge offices and visitor check-in. Portable cabin navigation groups offices, canteens, toilets, storage and high-security anti-vandal units.
- **Inference:** particularly useful precedent for grouping Gatehouse under both Security and Ticket/Visitor Control without duplicating the physical product.
- **Sources:** [modular buildings](https://www.wernick.co.uk/buildings/modular/); [hire buildings](https://www.wernick.co.uk/modular-hire/buildings/); [temporary accommodation taxonomy](https://www.wernick.co.uk/hire/solutions/); [portable cabin uses](https://www.wernick.co.uk/hire/solutions/portable-cabins/); [gatehouses](https://www.wernick.co.uk/hire/solutions/portable-cabins/gatehouse-units/); [anti-vandal modular buildings](https://www.wernick.co.uk/av-danzer/solutions/anti-vandal-modular-buildings/).

### 3. Algeco UK

- **UK-market evidence:** UK-specific site and Algeco UK entity; official materials describe UK delivery across commercial, education, healthcare and construction sectors.
- **Official sector/solution labels:** Education; Healthcare; Offices; Retail; Construction; Social Accommodation; Custodial Premises; Site Accommodation.
- **Named building uses:** site offices, canteens, changing rooms, toilets/showers, static/mobile welfare, gatehouses, classrooms, office accommodation, health centres/temporary wards, student residences, social housing, defence accommodation, catering kitchens, laundry facilities, storage containers, ticket offices, toll booths and weighbridge offices.
- **Product families:** permanent off-site buildings; modular hire; portable buildings; Moduflex and Fireflex welfare; Containex; anti-vandal cabins; Oasis welfare units; used/rental stock.
- **Delivery model:** temporary hire and permanent construction; stock and bespoke layouts; 360-degree turnkey option covering design/project management, groundworks, fit-out and external services.
- **Notable evidence:** Site Accommodation navigation is unusually clear: Site Offices, Site Canteens, Site Changing Rooms, Site Toilets & Showers, Static Welfare, Mobile Welfare and Site Gatehouses.
- **Inference:** high-value model for a task-led construction-site cluster. Category names match buyer language and can map directly to product layouts.
- **Sources:** [site accommodation](https://www.algeco.co.uk/site-accommodation); [welfare product options](https://www.algeco.co.uk/products/welfare-units); [social infrastructure/accommodation](https://www.algeco.co.uk/permanent/sectors/social-infrastructure); [healthcare](https://www.algeco.co.uk/permanent/sectors/healthcare); [why modular / sectors](https://www.algeco.co.uk/modular-buildings/why-choose-modular).

### 4. Premier Modular

- **UK-market evidence:** East Yorkshire company address and company number; official site identifies it as a UK modular specialist serving UK education, healthcare and infrastructure programmes.
- **Official sector labels:** Infrastructure; Education; Healthcare; Commercial & Industrial; Defence; Justice; Retail; Residential. Site Accommodation also appears in current content/navigation.
- **Named building uses:** project/site offices, welfare facilities, canteens/kitchens, drying/changing rooms, toilets/showers, meeting rooms, server rooms, retail kiosks, drive-through restaurants, pop-up stores, parcel collection units, testing buildings, stores, wards/health centres and single-living/student accommodation.
- **Product families:** temporary building hire/rental; permanent modular buildings; available/existing hire stock; sector-specific off-site buildings.
- **Delivery model:** urgent short-term, long-term rental or permanent; full end-to-end project management, groundworks, design, manufacture, fit-out, installation and aftercare; shell-only option for retail.
- **Notable evidence:** the available-buildings page exposes detailed layouts and capacities for site-accommodation, office and welfare stock. Retail has its own sector page with kiosks and drive-through formats.
- **Inference:** Premier supports merchandising solution pages around ready-to-deploy configurations, not only abstract sectors.
- **Sources:** [sector index](https://www.premiermodular.co.uk/sectors/); [available buildings](https://www.premiermodular.co.uk/solutions/temporary-building-hire/available-buildings/); [retail](https://www.premiermodular.co.uk/sectors/retail/); [infrastructure/site facilities](https://www.premiermodular.co.uk/the-importance-of-infrastructure-and-offsite-construction/); [commercial use cases](https://www.premiermodular.co.uk/why-commercial-modular-buildings-are-reshaping-uk-business-infrastructure/).

### 5. Thurston Group

- **UK-market evidence:** UK manufacturer founded in 1970, with Yorkshire factories; official site says it delivers nationwide and has UK public-sector framework positions.
- **Official sector labels:** Construction; Healthcare; Education; Commercial & Industrial; Sports & Leisure; Residential; Defence & Custodial; Specials & Bespoke. Core modular focus also names Infrastructure.
- **Named building uses:** offices, canteens, welfare units, toilets, changing rooms, training spaces, classrooms, healthcare buildings, homes/student accommodation, sports facilities, payment kiosks, taxi booking offices and security gatehouses.
- **Product families:** modular buildings; relocatable modular cabins; anti-vandal; eco-friendly; storage; fire-rated; refurbished cabins.
- **Delivery model:** turnkey design, plan, manufacture, installation and ready-for-occupation handover; semi-permanent/permanent modular and relocatable cabins; bespoke or pre-designed.
- **Notable evidence:** the cabin page explicitly cites office, canteen, changing and training uses and shows a Security Gatehouse case. Construction page explicitly lists office, canteen, welfare, toilet and changing-room uses.
- **Inference:** useful example of combining a sector taxonomy with a smaller, concrete cabin-use taxonomy.
- **Sources:** [cabins and sector list](https://thurstongroup.co.uk/cabins/); [construction uses](https://thurstongroup.co.uk/buildings-2/construction/); [turnkey by sector](https://thurstongroup.co.uk/thurston-turnkey-solution/); [UK framework evidence](https://thurstongroup.co.uk/trio-of-major-national-public-sector-framework-contracts-secured-2/).

### 6. Modulek

- **UK-market evidence:** UK contact details and nationwide portfolio; official site cites projects for schools, NHS trusts, AFC Bournemouth, J.P. Morgan, Wessex Water and other UK organisations.
- **Official solution labels:** Educational Buildings; Sports & Leisure Buildings; Commercial Buildings; Luxury Modular Lodges; Student Accommodation; Community Centres.
- **Named building uses:** classrooms, science labs, multipurpose facilities, training pavilions, changing rooms, showers/washrooms, offices, treatment areas, waiting rooms, catering/dining, welfare/breakout, retail units, lodges, student rooms, community hubs, site offices, security centres and control rooms.
- **Product families:** hybrid modular buildings; permanent or temporary bespoke systems; sector-specific education, sport/leisure, commercial/healthcare and accommodation buildings.
- **Delivery model:** bespoke fixed-price turnkey covering design, groundworks, delivery, installation and fit-out; structures promoted with a 60-year design life; adaptable, extendable and relocatable.
- **Notable evidence:** the water-sector page gives a particularly useful operational taxonomy: site offices/meeting rooms; welfare with canteens, kitchenettes, showers, changing and WCs; safety/security centres.
- **Inference:** strong precedent for mapping several functional solutions onto one operational-sector landing page.
- **Sources:** [building types](https://modulek.co.uk/modulek-buildings/); [broader solution taxonomy](https://modulek.co.uk/solutions/bespoke-modular-buildings/); [case-study filters](https://modulek.co.uk/case-studies/); [sports/changing uses](https://modulek.co.uk/modulek-buildings/sports-leisure-buildings/); [water-sector operational uses](https://modulek.co.uk/solutions/modular-buildings-water-sector/).

### 7. TG Escapes

- **UK-market evidence:** official site says it designs and builds across the UK and manufactures exclusively in the UK; reports more than 250 education buildings and 800 buildings over two decades.
- **Official sector labels:** Education; Commercial; Sport & Leisure. The home page also explicitly names healthcare, business and bespoke garden buildings.
- **Named building uses:** modular classrooms, SEND classrooms/inclusion bases, music rooms, dining halls, nurseries, Section 106 community buildings, sports/leisure buildings, clubhouses, offices, cafés/canteens, changing facilities, showers, toilets and garden rooms/buildings.
- **Product families:** permanent timber-frame/panelised eco buildings; education ranges; commercial buildings; sports/leisure; bespoke garden buildings.
- **Delivery model:** bespoke permanent structures; all-inclusive turnkey design/build with planning, foundations, installation, utilities and finishes; net-zero-in-operation positioning.
- **Notable evidence:** strongest specialist education taxonomy in the sample: building type plus education setting type (primary, secondary, further/higher, independent).
- **Inference:** valuable IA model for audience + use filters. Its garden proposition is an outlier among the commercial competitors.
- **Sources:** [home and UK scope](https://tgescapes.co.uk/); [modular buildings](https://tgescapes.co.uk/modular-buildings); [education building types](https://tgescapes.co.uk/buildings/education/education-resources-education); [customisation/use cases](https://tgescapes.co.uk/contractors/modular-buildings/customisation); [changing/showers/WCs](https://tgescapes.co.uk/how-modular-changing-rooms-can-transform-your-facility).

### 8. Integra Buildings

- **UK-market evidence:** East Yorkshire manufacturer supplying nationwide; official site describes UK manufacturing and delivery for public/private clients.
- **Official sector labels:** Sports & Leisure; Education; Offices & Commercial; Marketing Suites & Retail. About copy also explicitly names Healthcare, Site Accommodation and Welfare Accommodation.
- **Named building uses:** classrooms and multi-storey schools, NHS healthcare units, offices, cafés, marketing suites, retail, housing/apartments, restaurants, changing facilities and anti-vandal offices/canteens/WCs.
- **Product families:** bespoke modular buildings; single units; steel anti-vandal; anti-vandal modular and Modular Lite; permanent and temporary buildings.
- **Delivery model:** full turnkey from survey/concept/design and building regulations through manufacture, delivery, installation, fit-out and handover; purchase and hire lots are explicit in its current YPO framework appointment.
- **Notable evidence:** anti-vandal proposition is positioned as fully bespoke, linkable/stackable and capable of open-plan multi-unit buildings.
- **Inference:** relevant benchmark for a Security/Anti-vandal solution page backed by normal room uses rather than treated as a separate sector.
- **Sources:** [home and sector list](https://www.integrabuildings.co.uk/); [about/UK turnkey](https://www.integrabuildings.co.uk/about/); [anti-vandal](https://www.integrabuildings.co.uk/anti-vandal/); [offices/commercial](https://www.integrabuildings.co.uk/modular/offices-commercial/); [marketing/retail](https://www.integrabuildings.co.uk/modular/marketing-suites-retail/); [purchase/hire framework lots](https://www.integrabuildings.co.uk/integra-appointed-to-new-500m-public-sector-framework/).

### 9. Actiform

- **UK-market evidence:** West Yorkshire address and 45 years of UK construction/design/engineering experience; current UK defence, NHS, education and infrastructure projects.
- **Official sector labels:** Healthcare; Defence; Nuclear; Site-accommodation; Education; Industrial.
- **Named building uses:** offices, welfare buildings, canteens, occupational-health buildings, sleeper accommodation, classrooms, specialist teaching, student accommodation, laboratories, security/CCTV units, stores, shops, hospitals and ballistic/forensic/CTM facilities.
- **Product families:** engineered modular/off-site buildings; secure/blast-proof structures; specialist regulated-sector facilities; relocatable site accommodation.
- **Delivery model:** Consult, Build, Maintain, Repurpose; buy or hire; permanent or temporary; bespoke full 360-degree service including site preparation.
- **Notable evidence:** high-security positioning is unusually deep: defence page explicitly names high-security environments, live-fire ballistic ranges, CTM/forensic units and secure operational buildings.
- **Inference:** strongest specialist benchmark for a High-Security/Industrial landing page. It sells compliance and operational continuity before product form.
- **Sources:** [home/sector specialisms](https://actiform.co.uk/); [site accommodation](https://actiform.co.uk/sectors/site-accommodation/); [detailed legacy site-accommodation uses](https://actiform.co.uk/sectors/siteaccomodation/); [education](https://actiform.co.uk/sectors/education/); [defence/high security](https://actiform.co.uk/sectors/defence/); [hire and sale](https://actiform.co.uk/what-we-do/off-site-engineered-hire-sale/).

### 10. Cotaplan

- **UK-market evidence:** Wigan/North-West manufacturer established in 1982; official site says it supplies modular buildings across the UK.
- **Official solution labels:** Healthcare; Offices; Education; Commercial; Classrooms; Sports. Homepage also names Corporate, Retail and Leisure.
- **Named building uses:** NHS hospitals/extensions, laboratories, classrooms, schools, nurseries/pre-schools, offices, retail units, restaurants, hotels, canteens, dance studios, changing rooms, bathrooms/toilet blocks, foreman offices and storage.
- **Product families:** bespoke modular buildings; temporary/permanent; new, used/refurbished and hire stock; modular rooms and extensions.
- **Delivery model:** Buy New, Buy Refurbished, Hire and Sell; short/long-term hire; design, manufacture, delivery and turnkey installation.
- **Notable evidence:** procurement options are exposed at top level rather than buried. Education pages surface canteen, lab, classroom, nursery and sports/dance needs.
- **Inference:** strong model for letting visitors start by acquisition method as well as use case.
- **Sources:** [home, solutions and procurement](https://www.cotaplan.co.uk/); [modular rooms/use list](https://www.cotaplan.co.uk/modular-rooms/); [education](https://www.cotaplan.co.uk/education/); [healthcare/labs](https://www.cotaplan.co.uk/healthcare/modular-labs/); [project taxonomy](https://www.cotaplan.co.uk/project/).

### 11. Explore Modular

- **UK-market evidence:** Brentwood head office, South-East market positioning and UK schools/NHS/public-sector clients.
- **Official solution labels:** Site Accommodation; Modular Classrooms & Education; Modular Offices & Business; Modular Non Clinical Healthcare; Modular Events & Recreational.
- **Named building uses:** construction-site facilities, offices, welfare/changing facilities, shelter, storage, meeting rooms, classrooms, nurseries, teaching areas, communal staff areas, student accommodation, healthcare staff/welfare/meeting rooms, sports clubs, concerts and festivals.
- **Product families:** temporary/permanent custom modular buildings; refurbished/site accommodation projects; Containex units through a trading partnership.
- **Delivery model:** one-time purchase, lease or rent; full turnkey design, planning, delivery, installation and maintenance; temporary and permanent ranges.
- **Notable evidence:** service navigation uses five plain-language solution families and each follows the same three-step contact, selection, installation/maintenance flow.
- **Inference:** simple benchmark for a compact Solutions index. Clear wording beats construction jargon.
- **Sources:** [home](https://exploremodular.co.uk/); [services index](https://exploremodular.co.uk/services); [temporary/permanent and payment models](https://exploremodular.co.uk/services/modular-building-solutions); [site accommodation](https://exploremodular.co.uk/services/site-accommodation); [education](https://exploremodular.co.uk/services/modular-classrooms-education); [non-clinical healthcare](https://exploremodular.co.uk/services/modular-nonclinical-healthcare).

### 12. Cleveland Sitesafe

- **UK-market evidence:** manufactures in Middlesbrough and states UK-wide delivery; established in 1988; UK local-authority, environment, leisure and infrastructure clients.
- **Official solution labels:** Sports and Changing Facilities; Garages & Workshops; Visitor Centres; Clubhouses and Community Facilities; Public Toilets; Kiosks and Shops; Site Access and Welfare Facilities; Classrooms and Education Spaces.
- **Named building uses:** canteens, offices, changing/toilet areas, attendants cabins, welfare buildings, contractor depots, shops/kiosks, visitor centres, classrooms/youth facilities, sports pavilions, workshops/garages and secure equipment/hazardous-material storage.
- **Product families:** bespoke secure modular buildings; highly secure/vandal-resistant buildings; hazardous-substance stores; tool/equipment stores; gantries/platforms.
- **Delivery model:** bespoke design with drawings/specifications, UK manufacture, delivery/installation and relocatable buildings; site content is purchase/project-led rather than presenting a broad hire fleet.
- **Notable evidence:** clearest specialist taxonomy for small civic/leisure/access buildings. Security is a cross-cutting attribute: secure storage, vandal resistance and highly secure modular buildings.
- **Inference:** strong precedent for Visitor Centre, Kiosk/Shop, Clubhouse and Site Access pages—categories less visible at the biggest modular suppliers.
- **Sources:** [home/UK manufacturing](https://www.cleveland-sitesafe.co.uk/); [modular building categories](https://www.cleveland-sitesafe.co.uk/products/modular-buildings/); [complete product taxonomy](https://cleveland-sitesafe.co.uk/products/); [site access/welfare](https://www.cleveland-sitesafe.co.uk/products/modular-buildings/attendants-cabins/); [about/use list](https://www.cleveland-sitesafe.co.uk/about-us/cleveland-sitesafe/); [kiosks/shops](https://www.cleveland-sitesafe.co.uk/products/modular-buildings/kiosks-and-shops/).

## Cross-market naming patterns

### Level 1: sectors/problems

| Common label family | Typical official variants |
|---|---|
| Education | Education Facilities; Education & Childcare; Classroom & Education; Educational Buildings |
| Healthcare | Health Facilities; Healthcare; Non Clinical Healthcare; NHS Modular Hospitals |
| Construction/site | Site Accommodation; Construction; Infrastructure; Site-accommodation |
| Commercial | Offices; Offices & Commercial; Commercial & Industrial; Offices & Business |
| Sport/community | Sports & Leisure; Leisure; Events & Recreational; Community Facilities |
| Secure/regulated | Defence; Justice; Custodial; Nuclear; Anti-vandal; High-security |
| Living | Residential; Social Accommodation; Student Accommodation; Transitional Housing; Sleeper Accommodation |

### Level 2: concrete building uses

| Buyer need | Frequent labels |
|---|---|
| Work | Site Office; Office Accommodation; Project Office; Meeting Room; Training Room |
| Rest/feed workforce | Welfare Unit; Canteen; Mess Room; Kitchen; Breakout Space |
| Hygiene | Toilet Block; Shower Block; Washroom; Changing/Drying Room; Hygiene Room |
| Control access | Gatehouse; Security Lodge; Security Booth; CCTV Building; Attendants Cabin |
| Teach | Classroom; Teaching Block; SEND/Inclusion Base; Nursery; Laboratory; Lecture Theatre |
| Treat | Ward; Clinic; GP Surgery; Diagnostic Centre; Treatment/Consulting Room; Waiting Room |
| Sell/serve visitors | Retail Unit; Kiosk; Shop; Ticket Booth; Marketing Suite; Visitor Centre |
| Live/sleep | Student Residence; Sleeper Unit; Workforce Accommodation; Social Housing; Lodge |
| Store/protect | Secure Store; Storage Container; Equipment Store; Hazardous Substance Store |

## Implications for Karmod Solutions architecture

These recommendations are **inferences**, not competitor quotations.

1. Use a two-level model:
   - **Solutions by need/sector:** Construction Sites, Education, Healthcare, Workplaces, Security & Access, Retail & Visitor Services, Sport & Community, Accommodation.
   - **Building types within each:** Site Office, Canteen/Welfare, Toilet/Shower, Gatehouse, Classroom, Clinic, Kiosk, Storage, etc.
2. Give each physical product multiple solution relationships. A small glazed cabin can be a Gatehouse, Ticket Booth, Weighbridge Office or Visitor Check-in point; competitors reuse one product across these intents.
3. Keep acquisition model visible: Buy, Hire/Lease and Refurbished/Pre-owned where Karmod supports them.
4. Prioritise pages with both high competitor frequency and clear product fit: Education/Classrooms; Site Offices; Welfare/Canteens; Toilets/Showers/Changing; Healthcare; Storage; Accommodation; Retail/Kiosks.
5. Treat Gatehouse/Security Access as a distinct high-intent page despite lower frequency (8/12); terminology is stable and buyer-specific.
6. Position Garden Rooms below core B2B solutions unless analytics/customer demand supports more prominence. Only one sampled competitor makes it explicit.

## Limitations

- Website taxonomies change; findings reflect pages available on the access date.
- The sample intentionally over-represents firms comparable in UK modular commercial/education/site markets; it is not a census of portable-building suppliers.
- Binary tags measure explicit website evidence, not technical capability or revenue importance.
- Some explicit uses appear in first-party project pages rather than permanent top-level navigation. The matrix counts both; the company detail explains context.
- Counts should guide information architecture and content prioritisation, not be interpreted as UK market share.
