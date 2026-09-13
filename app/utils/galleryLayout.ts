export interface GalleryLayoutItem {
  id: string;
  aspectRatio: number;
}

export interface GalleryLayoutConfig {
  /** Width of the space being packed into, in px (the grid container's own width). */
  containerWidth: number;
  columns: number;
  gap: number;
  /** Aspect ratio at or above which a tile claims two columns instead of being squeezed into one. */
  wideAt?: number;
  /** 0–1. Lets each column's last tile stretch past its true ratio to square off the bottom edge. */
  flush?: number;
}

export interface GalleryTilePlacement {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  span: number;
}

export interface GalleryLayoutResult {
  placements: GalleryTilePlacement[];
  height: number;
}

const LOOKAHEAD = 2;
const WASTE_WEIGHT = 1;
const ORDER_PENALTY = 40;

interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
  span: number;
  col: number;
}

interface Candidate {
  cost: number;
  col: number;
  span: number;
  width: number;
  height: number;
  top: number;
}

/**
 * Packs items into a justified masonry grid, sized by each item's own aspect ratio. A tile whose
 * ratio is at or above `wideAt` claims two columns instead of being squeezed into one.
 *
 * Three passes: items are placed order-respecting with a short look-ahead, weighing each
 * candidate slot against the dead space it would create (so a short tile levels two columns
 * before a wide tile lands across them); the last `columns * 2` items are then placed
 * longest-first to level the ragged tail; and if `flush` is set, each column's final single-span
 * tile stretches to square off the bottom edge.
 */
export function computeMasonryLayout(
  items: GalleryLayoutItem[],
  config: GalleryLayoutConfig,
): GalleryLayoutResult {
  const { containerWidth, gap, wideAt = 1.7, flush = 0 } = config;
  const columns = Math.max(1, Math.round(config.columns));
  const columnWidth = (containerWidth - (columns - 1) * gap) / columns;

  const spanOf = (aspectRatio: number) =>
    Math.min(aspectRatio >= wideAt && columns >= 2 ? 2 : 1, columns);

  const columnHeights: number[] = new Array(columns).fill(0);
  const boxes = new Map<number, Box>();

  const place = (
    index: number,
    col: number,
    span: number,
    width: number,
    height: number,
    top: number,
  ) => {
    for (let k = col; k < col + span; k++) columnHeights[k] = top + height + gap;
    boxes.set(index, { left: col * (columnWidth + gap), top, width, height, span, col });
  };

  const cheapestPlacement = (aspectRatio: number, penalty: number): Candidate => {
    const span = spanOf(aspectRatio);
    const width = columnWidth * span + gap * (span - 1);
    const height = width / aspectRatio;
    let best: Candidate | null = null;
    for (let col = 0; col + span <= columns; col++) {
      let top = 0;
      for (let k = col; k < col + span; k++) top = Math.max(top, columnHeights[k]!);
      let waste = 0;
      for (let k = col; k < col + span; k++) waste += top - columnHeights[k]!;
      const cost = top + WASTE_WEIGHT * waste + penalty;
      if (!best || cost < best.cost - 1e-9) best = { cost, col, span, width, height, top };
    }
    return best!;
  };

  const remaining = items.map((_, index) => index);
  const tailCount = Math.min(remaining.length, columns * 2);

  while (remaining.length > tailCount) {
    let best: Candidate | null = null;
    let bestOffset = 0;
    for (let offset = 0; offset < Math.min(LOOKAHEAD + 1, remaining.length); offset++) {
      const candidate = cheapestPlacement(
        items[remaining[offset]!]!.aspectRatio,
        ORDER_PENALTY * offset,
      );
      if (!best || candidate.cost < best.cost - 1e-9) {
        best = candidate;
        bestOffset = offset;
      }
    }
    const itemIndex = remaining[bestOffset]!;
    place(itemIndex, best!.col, best!.span, best!.width, best!.height, best!.top);
    remaining.splice(bestOffset, 1);
  }

  const tileHeight = (index: number) => {
    const span = spanOf(items[index]!.aspectRatio);
    const width = columnWidth * span + gap * (span - 1);
    return width / items[index]!.aspectRatio;
  };
  remaining.sort((a, b) => {
    const spanA = spanOf(items[a]!.aspectRatio);
    const spanB = spanOf(items[b]!.aspectRatio);
    if (spanA !== spanB) return spanB - spanA;
    return tileHeight(b) - tileHeight(a);
  });
  remaining.forEach((itemIndex) => {
    const placement = cheapestPlacement(items[itemIndex]!.aspectRatio, 0);
    place(itemIndex, placement.col, placement.span, placement.width, placement.height, placement.top);
  });

  let height = 0;
  for (let k = 0; k < columns; k++) height = Math.max(height, columnHeights[k]! - gap);

  if (flush > 0) {
    const lowestInColumn = new Map<number, number>();
    boxes.forEach((box, index) => {
      for (let k = box.col; k < box.col + box.span; k++) {
        const currentIndex = lowestInColumn.get(k);
        const currentBottom = currentIndex === undefined ? -Infinity : boxes.get(currentIndex)!.top + boxes.get(currentIndex)!.height;
        if (box.top + box.height > currentBottom) lowestInColumn.set(k, index);
      }
    });
    for (let k = 0; k < columns; k++) {
      const index = lowestInColumn.get(k);
      if (index === undefined) continue;
      const box = boxes.get(index)!;
      if (box.span !== 1) continue;
      const shortfall = height - (box.top + box.height);
      if (shortfall > 0) box.height += Math.min(shortfall, flush * box.height);
    }
  }

  const round = (value: number) => Math.round(value * 100) / 100;
  const placements = items.map((item, index) => {
    const box = boxes.get(index)!;
    return {
      id: item.id,
      left: round(box.left),
      top: round(box.top),
      width: round(box.width),
      height: round(box.height),
      span: box.span,
    };
  });

  return { placements, height: round(height) };
}

/** A placement's inline `position: absolute` box, ready to hand straight to an element's `style`. */
export function placementToStyle(placement: GalleryTilePlacement | undefined) {
  if (!placement) return { display: "none" };
  return {
    left: `${placement.left}px`,
    top: `${placement.top}px`,
    width: `${placement.width}px`,
    height: `${placement.height}px`,
  };
}

export interface GalleryColumnPlan {
  columns: number;
  gap: number;
}

/**
 * Column count and gutter for a given grid container width.
 *
 * Thresholds key off the grid's own measured width, not the viewport — the grid sits inside a
 * padded, max-width page container, so a mockup's viewport breakpoints (e.g. a 1440px desktop
 * frame) wouldn't reliably fire here. Tailwind's own `sm`/`lg` scale keeps this in step with the
 * rest of the site instead.
 */
export function resolveGalleryColumns(containerWidth: number): GalleryColumnPlan {
  if (containerWidth >= 1024) return { columns: 4, gap: 20 };
  if (containerWidth >= 640) return { columns: 3, gap: 16 };
  return { columns: 2, gap: 12 };
}
