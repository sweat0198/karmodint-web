import { describe, expect, it } from "vitest";
import { REFERENCE_SEEDS } from "../../scripts/references/data";
import { buildReferenceDocuments } from "../../scripts/references/buildDocuments";

describe("reference migration documents", () => {
  const assetIds = Object.fromEntries(
    REFERENCE_SEEDS.map((seed) => [
      seed.logoPath,
      `image-${seed.id}-100x50-png`,
    ]),
  );
  const documents = buildReferenceDocuments(REFERENCE_SEEDS, assetIds);

  it("builds eight deterministic documents in supplied display order", () => {
    expect(documents).toHaveLength(8);
    expect(documents.map((document) => document.displayOrder)).toEqual([
      10, 20, 30, 40, 50, 60, 70, 80,
    ]);
    expect(new Set(documents.map((document) => document._id)).size).toBe(8);
  });

  it("keeps West Haddon and Luton as drafts only", () => {
    expect(
      documents
        .filter((document) => document._id.startsWith("drafts."))
        .map((document) => document.companyName),
    ).toEqual(["West Haddon Council", "Luton Sea Cadet"]);
  });

  it("includes websites when supplied on seeds", () => {
    expect(
      documents.find((doc) => doc.companyName === "W Hotel Edinburgh")?.website,
    ).toBe("https://www.marriott.com/en-gb/hotels/ediwh-w-edinburgh/overview/");
  });

  it("fails when an uploaded asset reference is missing", () => {
    expect(() => buildReferenceDocuments(REFERENCE_SEEDS, {})).toThrow(
      "Missing uploaded logo",
    );
  });
});
