# Solution Selection 21:9 Outpaint Design

## Goal

Extend every 16:9 solution-selection PNG horizontally to a 21:9 presentation image while preserving every source pixel, cabin position, and cabin scale.

## Scope

- Process the ten exact `1536x864` PNGs in `public/images/solutions/selection/`.
- Process `garden-rooms-and-garden-offices.png` (`1672x941`), whose aspect ratio rounds to 16:9.
- Exclude `retail-and-food-service-kiosks.jpg` (`1200x896`).
- Leave every source file unchanged.

## Approach

Generate a scene-aware wide outpaint for each source. Continue only background context at the left and right: site fencing, ground, sky, and context buildings already supported by the source scene. Then composite the original source pixels over the generated center. This final compositing step guarantees that the original frame, including the cabin, remains pixel-identical.

Save sibling outputs with a `-21x9.png` suffix. Exact `1536x864` sources become `2016x864`, adding 240 pixels on each side. The `1672x941` garden source becomes `2196x941`, the closest integer-width 21:9 canvas, adding 262 pixels on each side.

## Validation

- Confirm output dimensions.
- Crop each output's centered source rectangle and compare it byte-for-byte at pixel level with its source.
- Confirm source files retain their original checksums.
- Visually inspect every output for coherent seams, perspective, lighting, and forbidden new foreground subjects.
