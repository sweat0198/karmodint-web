# Vision and Mission Photorealistic Scenes Design

## Goal

Replace restrained abstract composites with attractive, photorealistic images of imagined completed modular projects built from multiple recognisable catalogue product families.

## Chosen Direction

Create two distinct completed-project concept visualisations. Use catalogue renders as visual references rather than separate foreground layers, allowing products to feel installed, connected, landscaped, and human-scaled. Scenes remain fictional marketing visualisations: no project names, client identities, signs, or claims appear in-image. Each card carries a visible `Concept visualisation` disclosure, and alt text uses the same truthful framing.

## Vision Scene

- Premium landscaped modular business campus in a contemporary UK setting.
- Several beige-and-white K7001/K2004 container modules form a coherent L-shaped, single-storey complex.
- Glazed entrances, accessible paved paths, native grasses, young trees, and restrained outdoor seating make the project feel finished.
- Warm late-afternoon light; editorial architectural photography; optimistic, spacious mood.
- Wide 2.6:1 framing with the whole campus legible inside a responsive 2.3:1 card frame.

## Mission Scene

- Completed community and operations campus in a green UK setting.
- Beige-and-white container modules provide the main building; Metro City, composite, and GRP cabins appear as coordinated support structures.
- Clean pedestrian routes, planted edges, bicycle stands, and a few naturally placed visitors communicate usefulness and scale.
- Bright soft overcast daylight; documentary architectural photography; dependable, active mood.
- Wide framing with all product families remaining readable inside a responsive 2.3:1 card frame.

## Visual Constraints

- Preserve defining product language from supplied references: modular frame rhythm, white wall panels, beige container frames, dark Metro City/composite trim, rounded white GRP shells.
- Avoid construction state, cranes, heavy machinery, mud, temporary fencing, visible text, invented signage, fake logos, aerial-drone distortion, and implausible stacked geometry.
- People stay secondary and cannot obscure products.
- No text baked into either image.

## Integration

- Create versioned assets under `public/images/about/`.
- Replace the two-layer backdrop/product stacks with one scene image per card.
- Keep current Vision/Mission copy, order, icons, lazy loading, and async decoding.
- Use a responsive 2.3:1 frame so mobile layouts retain the full campus composition.
- Keep scene imagery static; product-only motion is impossible once the products and environment share one raster.
- Add a visible `Concept visualisation` disclosure to prevent an imagined scene being read as client project evidence.
- Optimize final images for card delivery with WebP derivatives and PNG/JPEG fallbacks if needed.

## Verification

- Visually inspect product recognisability, environment quality, crop resilience, and forbidden details.
- Test exact scene paths, asset existence, visible disclosure, accessible alt text, responsive sizing, lazy loading, decoding, and object-cover behaviour.
- Run focused test, full suite, production build, rendered-output path check, and graph refresh.
