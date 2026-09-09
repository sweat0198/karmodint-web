export const METERS_TO_FEET = 3.28084

export function metersToFeet(meters: number): number {
  return Math.round(meters * METERS_TO_FEET)
}

function formatMeters(meters: number): string {
  return `${meters.toFixed(2)}m`
}

/** Imperial-primary dimension value, for example `8ft (2.40m)`. */
export function formatImperialDimension(meters: number): string {
  return `${metersToFeet(meters)}ft (${formatMeters(meters)})`
}

/**
 * Footprint label for a size option. Feet sort greatest-first for the primary label;
 * metres remain smallest-first in brackets, matching the catalogue's original convention.
 */
export function formatFootprintLabel(lengthM: number, widthM: number): string {
  const feet = [metersToFeet(lengthM), metersToFeet(widthM)].sort((a, b) => b - a)
  const meters = [lengthM, widthM].sort((a, b) => a - b).map(formatMeters)
  return `${feet[0]}ft × ${feet[1]}ft (${meters[0]} × ${meters[1]})`
}
