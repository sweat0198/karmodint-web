import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  CATALOGUE_CATEGORY_TREE_QUERY,
  findUnknownCatalogueFilters,
} from "../../modules/legacy-redirects/catalogueFilters";
import { REDIRECTS } from "../../shared/migration/redirects";
import { executeGroq } from "../utils/groqRunner";

const tree = [
  { slug: "containers", children: [] },
  { slug: "cabin", children: [{ slug: "grp" }, { slug: "metro-city" }] },
];

describe("findUnknownCatalogueFilters", () => {
  it("passes catalogue filters that name a top-level category and one of its subcategories", () => {
    expect(
      findUnknownCatalogueFilters(
        ["/", "/products/", "/products/?category=containers", "/products/?category=cabin&subcategory=metro-city"],
        tree,
      ),
    ).toEqual([]);
  });

  it("flags a subcategory the category doesn't have", () => {
    expect(findUnknownCatalogueFilters(["/products/?category=cabin&subcategory=metrocity"], tree)).toEqual([
      '/products/?category=cabin&subcategory=metrocity: "cabin" has no subcategory "metrocity"',
    ]);
  });

  it("flags a category that isn't top-level, and a subcategory with no category", () => {
    expect(
      findUnknownCatalogueFilters(["/products/?category=grp", "/products/?subcategory=grp"], tree),
    ).toEqual([
      '/products/?category=grp: no top-level category "grp"',
      "/products/?subcategory=grp: a subcategory needs its category",
    ]);
  });
});

// The datasets are seeded from sanity/seeds; the tree query runs against those documents as it would against Sanity.
describe("shipped redirect targets", () => {
  it("filter the catalogue only by categories the seeds define", async () => {
    const seeds = ["categories.ndjson", "cabin-subcategories.ndjson"].flatMap((file) =>
      readFileSync(path.join(__dirname, "../../sanity/seeds", file), "utf8")
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => JSON.parse(line)),
    );
    const seededTree = await executeGroq(CATALOGUE_CATEGORY_TREE_QUERY, {}, seeds);

    expect(findUnknownCatalogueFilters(REDIRECTS.map((redirect) => redirect.to), seededTree)).toEqual([]);
    expect(REDIRECTS.some((redirect) => redirect.to.includes("subcategory="))).toBe(true);
  });
});
