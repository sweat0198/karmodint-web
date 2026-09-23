# Car Park Lane Alignment Design

## Goal

Correct the entrance-lane perspective in the car park cabin image so vehicles clearly follow one route into the left barrier.

## Design

- Keep cabin, barriers, landscaping, building, weather, lighting, crop, and 21:9 dimensions unchanged.
- Reposition the left-lane vehicles onto the lane centreline.
- Redraw only affected dashed boundaries and directional arrow so all converge toward the left barrier with one consistent vanishing point.
- Preserve photorealism, wet-road reflections, UK road orientation, and existing visual hierarchy.
- Save non-destructive edited candidate first; replace source only after visual validation.

## Validation

- Cars sit fully inside the entrance lane and point toward its barrier.
- Arrow and dashed markings describe the same route.
- No duplicated vehicles, warped cabin geometry, broken barrier, text, or watermark.
- Output dimensions match source.
