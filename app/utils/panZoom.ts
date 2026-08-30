/**
 * Geometry for a zoomable image stage: how far a scaled frame may travel before its edge would
 * come inside the stage box.
 */

export interface PanOffset {
  x: number;
  y: number;
}

export interface StageSize {
  width: number;
  height: number;
}

export const ZOOM_MIN = 60;
export const ZOOM_MAX = 160;
export const ZOOM_STEP = 20;
export const ZOOM_DEFAULT = 100;

export function clampZoom(zoom: number): number {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom));
}

/**
 * Half the overflow of the scaled frame, per axis — the furthest the frame may be pushed in
 * either direction from centre.
 *
 * Measured against the stage box rather than the artwork inside it. The frames are
 * `object-contain`, so a render that letterboxes inside the stage gets a few pixels of slack past
 * its own edge — the forgiving direction to be wrong in, and it keeps the maths independent of
 * whichever carousel frame, at whichever aspect ratio, happens to be showing.
 */
export function panBounds(zoom: number, stage: StageSize): PanOffset {
  if (zoom <= ZOOM_DEFAULT) return { x: 0, y: 0 };
  // Kept in percent until the final division: `(zoom / 100 - 1)` rounds 120% to 0.19999…, which
  // leaves the bound a hair short of the value the zoom steps are meant to produce.
  const overflowRatio = (zoom - ZOOM_DEFAULT) / 200;
  return { x: stage.width * overflowRatio, y: stage.height * overflowRatio };
}

export function clampPan(offset: PanOffset, zoom: number, stage: StageSize): PanOffset {
  const bounds = panBounds(zoom, stage);
  return {
    x: Math.min(bounds.x, Math.max(-bounds.x, offset.x)),
    y: Math.min(bounds.y, Math.max(-bounds.y, offset.y)),
  };
}
