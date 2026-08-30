import { describe, expect, it } from "vitest";
import {
  ZOOM_DEFAULT,
  ZOOM_MAX,
  ZOOM_MIN,
  clampPan,
  clampZoom,
  panBounds,
} from "~/utils/panZoom";

const STAGE = { width: 640, height: 360 };

describe("clampZoom", () => {
  it("keeps a level inside the viewer's range", () => {
    expect(clampZoom(120)).toBe(120);
  });

  it("pins levels past either end to the range", () => {
    expect(clampZoom(ZOOM_MAX + 40)).toBe(ZOOM_MAX);
    expect(clampZoom(ZOOM_MIN - 40)).toBe(ZOOM_MIN);
  });
});

describe("panBounds", () => {
  it("allows no travel until the frame is larger than its stage", () => {
    expect(panBounds(ZOOM_DEFAULT, STAGE)).toEqual({ x: 0, y: 0 });
    expect(panBounds(ZOOM_MIN, STAGE)).toEqual({ x: 0, y: 0 });
  });

  it("allows half the overflow on each axis, so an edge can reach the stage edge", () => {
    // 150% of a 640×360 stage overflows by 320×180 in total, half of it per side.
    expect(panBounds(150, STAGE)).toEqual({ x: 160, y: 90 });
  });

  it("has nothing to travel across when the stage has not been measured yet", () => {
    expect(panBounds(160, { width: 0, height: 0 })).toEqual({ x: 0, y: 0 });
  });
});

describe("clampPan", () => {
  it("passes through an offset already inside the bounds", () => {
    expect(clampPan({ x: 100, y: -50 }, 150, STAGE)).toEqual({ x: 100, y: -50 });
  });

  it("stops each axis at its own bound rather than the larger one", () => {
    expect(clampPan({ x: 500, y: 500 }, 150, STAGE)).toEqual({ x: 160, y: 90 });
    expect(clampPan({ x: -500, y: -500 }, 150, STAGE)).toEqual({ x: -160, y: -90 });
  });

  it("recentres the frame once it no longer overflows the stage", () => {
    expect(clampPan({ x: 120, y: 60 }, ZOOM_DEFAULT, STAGE)).toEqual({ x: 0, y: 0 });
  });
});
