const SANITY_CDN_BASE = "https://cdn.sanity.io/images";

/** Parses a Sanity asset `_ref`/`_id`, e.g. `image-<hash>-<width>x<height>-<format>`. */
function parseAssetRef(
  assetRef: string,
): { hash: string; width: number; height: number; format: string } | null {
  const parts = assetRef.split("-");
  if (parts[0] !== "image" || parts.length < 4) return null;

  const format = parts.at(-1)!;
  const dimensions = parts.at(-2)!;
  const match = dimensions.match(/^(\d+)x(\d+)$/);
  if (!match) return null;

  return {
    hash: parts.slice(1, -2).join("-"),
    width: Number(match[1]),
    height: Number(match[2]),
    format,
  };
}

/** CDN resize parameters. Omit both for the untransformed original. */
export interface SanityImageTransform {
  width?: number;
  fit?: "max" | "crop" | "clip" | "fill";
}

/**
 * Builds the public CDN URL for a Sanity image asset reference. `<SanityImage>` handles the
 * rendered `<img>` markup itself — this is for the places that need a plain URL string instead,
 * such as JSON-LD `image` fields, outbound quote emails, and the image carousel.
 */
export function sanityImageUrl(
  assetRef: string | undefined,
  projectId: string,
  dataset: string,
  transform: SanityImageTransform = {},
): string | undefined {
  if (!assetRef) return undefined;
  const parsed = parseAssetRef(assetRef);
  if (!parsed) return undefined;

  const base = `${SANITY_CDN_BASE}/${projectId}/${dataset}/${parsed.hash}-${parsed.width}x${parsed.height}.${parsed.format}`;

  const params = new URLSearchParams();
  if (transform.width) params.set("w", String(transform.width));
  if (transform.fit) params.set("fit", transform.fit);
  const query = params.toString();

  return query ? `${base}?${query}` : base;
}
