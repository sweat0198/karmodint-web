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

/**
 * Builds the public CDN URL for a Sanity image asset reference. `<SanityImage>` handles the
 * rendered `<img>` markup itself — this is for the places that need a plain URL string instead,
 * such as JSON-LD `image` fields and outbound quote emails.
 */
export function sanityImageUrl(
  assetRef: string | undefined,
  projectId: string,
  dataset: string,
): string | undefined {
  if (!assetRef) return undefined;
  const parsed = parseAssetRef(assetRef);
  if (!parsed) return undefined;
  return `${SANITY_CDN_BASE}/${projectId}/${dataset}/${parsed.hash}-${parsed.width}x${parsed.height}.${parsed.format}`;
}
