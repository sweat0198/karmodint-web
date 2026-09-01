# Homepage Container Hero Images Design

## Goal

Replace the first two homepage hero slides with attractive, product-faithful images of Karmod's best-selling 2.3 × 6 m and 3 × 7 m modular containers in distinct UK settings.

## Creative Direction

Use two real-world deployment scenes rather than a shared location:

- 2.3 × 6 m container: compact site office on a tidy British construction site.
- 3 × 7 m container: larger site office at a modern UK commercial development.

Both images should use natural UK daylight, restrained props, realistic paving and vegetation, and recognisably British surrounding architecture. Preserve each reference product's dimensions, frame, panel treatment, door and window layout, and colours. Avoid people, generated copy, fake logos, tropical vegetation, excessive construction clutter, and luxury garden-room styling.

## Composition

The existing carousel renders images with `object-cover` inside a responsive frame whose aspect ratio varies around 1.2–1.4:1. Generate landscape images with the complete container inside a central crop-safe area. Let the product dominate the frame while retaining enough environmental context to establish UK use.

The lower-left area receives a glass information badge and the upper-right receives a slide counter. Keep critical product details away from those overlays.

## Integration

Save web-optimised assets under `public/images/hero/`. Update only the first two entries in `app/components/HeroSection.vue`:

- Slide 1: `2.3 × 6 m Modular Container`
- Slide 2: `3 × 7 m Modular Container`

Update subtitles to describe their respective site-office use. Keep the remaining three slides, timing, controls, and transitions unchanged.

## Quality and Verification

- Visually inspect both generated images for product fidelity and UK setting.
- Confirm suitable landscape dimensions and efficient web formats.
- Test first-two-slide paths, titles, subtitles, and alt text through the rendered component.
- Run the focused component test, full test suite, and production build.

