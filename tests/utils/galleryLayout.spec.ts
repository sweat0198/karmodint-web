import { describe, expect, it } from "vitest";
import {
  computeMasonryLayout,
  placementToStyle,
  resolveGalleryColumns,
  type GalleryLayoutItem,
} from "~/utils/galleryLayout";

describe("placementToStyle", () => {
  it("converts a placement into an inline absolute-position style", () => {
    expect(placementToStyle({ id: "a", left: 10, top: 20, width: 100, height: 50, span: 1 })).toEqual({
      left: "10px",
      top: "20px",
      width: "100px",
      height: "50px",
    });
  });

  it("hides the tile when no placement was found", () => {
    expect(placementToStyle(undefined)).toEqual({ display: "none" });
  });
});

describe("resolveGalleryColumns", () => {
  it("gives 2 columns below the tablet breakpoint", () => {
    expect(resolveGalleryColumns(390)).toEqual({ columns: 2, gap: 12 });
    expect(resolveGalleryColumns(639)).toEqual({ columns: 2, gap: 12 });
  });

  it("gives 3 columns from the tablet breakpoint", () => {
    expect(resolveGalleryColumns(640)).toEqual({ columns: 3, gap: 16 });
    expect(resolveGalleryColumns(1023)).toEqual({ columns: 3, gap: 16 });
  });

  it("gives 4 columns from the desktop breakpoint", () => {
    expect(resolveGalleryColumns(1024)).toEqual({ columns: 4, gap: 20 });
    expect(resolveGalleryColumns(1440)).toEqual({ columns: 4, gap: 20 });
  });
});

describe("computeMasonryLayout", () => {
  it("places a single square tile flush in the top-left column", () => {
    const items: GalleryLayoutItem[] = [{ id: "a", aspectRatio: 1 }];
    const { placements, height } = computeMasonryLayout(items, {
      containerWidth: 400,
      columns: 2,
      gap: 10,
    });

    expect(placements).toHaveLength(1);
    expect(placements[0]).toMatchObject({ id: "a", left: 0, top: 0, span: 1 });
    expect(placements[0].width).toBeCloseTo(195); // (400 - 10) / 2
    expect(placements[0].height).toBeCloseTo(195); // square, ar = 1
    expect(height).toBeCloseTo(195);
  });

  it("spans two columns once an item's aspect ratio reaches wideAt", () => {
    const narrow: GalleryLayoutItem[] = [{ id: "square", aspectRatio: 1 }];
    const wide: GalleryLayoutItem[] = [{ id: "pano", aspectRatio: 2 }];
    const config = { containerWidth: 400, columns: 2, gap: 10, wideAt: 1.7 };

    expect(computeMasonryLayout(narrow, config).placements[0].span).toBe(1);
    expect(computeMasonryLayout(wide, config).placements[0].span).toBe(2);
  });

  it("never spans more columns than the grid has", () => {
    const items: GalleryLayoutItem[] = [{ id: "pano", aspectRatio: 3 }];
    const { placements } = computeMasonryLayout(items, {
      containerWidth: 400,
      columns: 1,
      gap: 10,
      wideAt: 1.7,
    });

    expect(placements[0].span).toBe(1);
  });

  it("places every item exactly once, preserving item order in the output", () => {
    const items: GalleryLayoutItem[] = Array.from({ length: 9 }, (_, i) => ({
      id: `t${i}`,
      aspectRatio: 0.6 + (i % 4) * 0.4,
    }));
    const { placements } = computeMasonryLayout(items, {
      containerWidth: 900,
      columns: 3,
      gap: 12,
      wideAt: 1.7,
    });

    expect(placements.map((p) => p.id)).toEqual(items.map((i) => i.id));
    expect(new Set(placements.map((p) => p.id)).size).toBe(items.length);
  });

  it("keeps every tile within the container's horizontal bounds", () => {
    const items: GalleryLayoutItem[] = Array.from({ length: 12 }, (_, i) => ({
      id: `t${i}`,
      aspectRatio: [0.7, 1, 1.3, 1.9, 2.4][i % 5],
    }));
    const config = { containerWidth: 1024, columns: 4, gap: 20, wideAt: 1.7 };
    const { placements } = computeMasonryLayout(items, config);

    for (const placement of placements) {
      expect(placement.left).toBeGreaterThanOrEqual(0);
      expect(placement.left + placement.width).toBeLessThanOrEqual(config.containerWidth + 0.5);
    }
  });

  it("never places two tiles overlapping in the same column band", () => {
    const items: GalleryLayoutItem[] = Array.from({ length: 14 }, (_, i) => ({
      id: `t${i}`,
      aspectRatio: [0.7, 1, 1.3, 1.9, 2.4][i % 5],
    }));
    const config = { containerWidth: 1024, columns: 4, gap: 20, wideAt: 1.7 };
    const { placements } = computeMasonryLayout(items, config);

    // Bucket placements by which columns they occupy, then check no two overlap vertically.
    const columnWidth = (config.containerWidth - (config.columns - 1) * config.gap) / config.columns;
    const colOf = (left: number) => Math.round(left / (columnWidth + config.gap));

    const byColumn = new Map<number, typeof placements>();
    for (const p of placements) {
      const span = Math.round((p.width + config.gap) / (columnWidth + config.gap));
      for (let c = colOf(p.left); c < colOf(p.left) + span; c++) {
        byColumn.set(c, [...(byColumn.get(c) ?? []), p]);
      }
    }

    for (const tiles of byColumn.values()) {
      const sorted = [...tiles].sort((a, b) => a.top - b.top);
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i].top).toBeGreaterThanOrEqual(sorted[i - 1].top + sorted[i - 1].height - 0.5);
      }
    }
  });

  it("places the tail longest-first (tallest tile lands before the shortest)", () => {
    // Both items fall inside the tail window (tailCount = columns * 2 = 2), so which one lands
    // first is purely down to the tail sort, not the look-ahead pass.
    const items: GalleryLayoutItem[] = [
      { id: "short", aspectRatio: 4 }, // wide/short: 200x50
      { id: "tall", aspectRatio: 0.5 }, // narrow/tall: 200x400
    ];
    const { placements } = computeMasonryLayout(items, { containerWidth: 200, columns: 1, gap: 10 });

    const tall = placements.find((p) => p.id === "tall")!;
    const short = placements.find((p) => p.id === "short")!;

    expect(tall.top).toBe(0);
    expect(short.top).toBeCloseTo(tall.height + 10);
  });

  it("stretches the shortest tail tile to close the bottom edge when flush is set", () => {
    const items: GalleryLayoutItem[] = [
      { id: "a", aspectRatio: 1 },
      { id: "b", aspectRatio: 1.5 },
    ];
    const config = { containerWidth: 400, columns: 2, gap: 10 };

    const unflushed = computeMasonryLayout(items, { ...config, flush: 0 });
    const flushed = computeMasonryLayout(items, { ...config, flush: 0.3 });

    const shortTileId = unflushed.placements.reduce((shortest, p) =>
      p.height < shortest.height ? p : shortest,
    ).id;
    const before = unflushed.placements.find((p) => p.id === shortTileId)!;
    const after = flushed.placements.find((p) => p.id === shortTileId)!;

    expect(after.height).toBeGreaterThan(before.height);
  });

  it("returns zero height for an empty item list", () => {
    expect(computeMasonryLayout([], { containerWidth: 400, columns: 2, gap: 10 })).toEqual({
      placements: [],
      height: 0,
    });
  });
});
