import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { SOLUTION_COVERS } from "../../scripts/solutions/data";
import { planCoverPatches, type SolutionRecord } from "../../scripts/solutions/planCoverPatches";
import { repoPath } from "../../scripts/catalogue/lib/paths";

const covers = [
  { slug: "site-offices", imagePath: "public/images/solutions/site-offices.png", alt: "Site office" },
  { slug: "accommodation-units", imagePath: "public/images/solutions/accommodation-units.png", alt: "Accommodation" },
];
const assetIds = Object.fromEntries(
  covers.map((cover, index) => [cover.imagePath, `image-${"ab"[index].repeat(3)}-1536x864-png`]),
);
const solutions: SolutionRecord[] = [
  { _id: "solution-site-offices", slug: "site-offices" },
  { _id: "solution-accommodation-units", slug: "accommodation-units" },
];

describe("solution cover patches", () => {
  it("sets coverImage with the uploaded asset and alt text", () => {
    expect(planCoverPatches(covers, solutions, assetIds)).toEqual([
      {
        documentId: "solution-site-offices",
        coverImage: {
          _type: "image",
          asset: { _type: "reference", _ref: "image-aaa-1536x864-png" },
          alt: "Site office",
        },
      },
      {
        documentId: "solution-accommodation-units",
        coverImage: {
          _type: "image",
          asset: { _type: "reference", _ref: "image-bbb-1536x864-png" },
          alt: "Accommodation",
        },
      },
    ]);
  });

  it("patches a pending draft alongside the published document", () => {
    const withDraft = [...solutions, { _id: "drafts.solution-site-offices", slug: "site-offices" }];
    expect(
      planCoverPatches(covers, withDraft, assetIds).map((patch) => patch.documentId),
    ).toEqual([
      "solution-site-offices",
      "drafts.solution-site-offices",
      "solution-accommodation-units",
    ]);
  });

  it("fails when a cover names a Solution that is not in the dataset", () => {
    expect(() => planCoverPatches(covers, solutions.slice(0, 1), assetIds)).toThrow(
      'No Solution with slug "accommodation-units"',
    );
  });

  it("fails when a Solution in the dataset has no cover", () => {
    const extra = [...solutions, { _id: "solution-new", slug: "new-solution" }];
    expect(() => planCoverPatches(covers, extra, assetIds)).toThrow(
      'No cover selected for Solution "new-solution"',
    );
  });

  it("fails when a cover's image was not uploaded", () => {
    expect(() => planCoverPatches(covers, solutions, {})).toThrow("Missing uploaded cover");
  });
});

describe("selected Solution covers", () => {
  it("names twelve distinct Solutions, each with alt text and an image on disk", () => {
    expect(SOLUTION_COVERS).toHaveLength(12);
    expect(new Set(SOLUTION_COVERS.map((cover) => cover.slug)).size).toBe(12);
    for (const cover of SOLUTION_COVERS) {
      expect(cover.alt.trim(), cover.slug).not.toBe("");
      expect(fs.existsSync(repoPath(cover.imagePath)), cover.imagePath).toBe(true);
    }
  });
});
