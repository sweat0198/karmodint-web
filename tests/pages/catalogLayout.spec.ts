import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("products desktop layout", () => {
  const source = fs.readFileSync(
    path.resolve(process.cwd(), "app/pages/products/index.vue"),
    "utf8",
  );

  it("places sticky category navigation to the right of the product grid", () => {
    const productGrid = source.indexOf('<main class="flex-1');
    const categorySidebar = source.indexOf("<aside", productGrid);
    const footerCta = source.indexOf("<!-- Footer CTA Section -->", categorySidebar);

    expect(productGrid).toBeGreaterThan(-1);
    expect(categorySidebar).toBeGreaterThan(productGrid);
    expect(footerCta).toBeGreaterThan(categorySidebar);

    const sidebarMarkup = source.slice(categorySidebar, categorySidebar + 220);
    expect(sidebarMarkup).toMatch(
      /class="[^"]*\bsticky\b[^"]*\btop-24\b[^"]*\bself-start\b[^"]*"/,
    );
  });

  it("places product search after breadcrumbs on mobile and at the desktop row end", () => {
    const mobileBreadcrumbs = source.indexOf("<!-- Breadcrumbs (Figma 50:11) -->");
    const mobileSearch = source.indexOf('input-id="catalog-search-mobile"');
    const desktopBreadcrumbs = source.indexOf(
      "<!-- Breadcrumbs in Main Catalog Layout (Desktop) -->",
    );
    const desktopSearch = source.indexOf('input-id="catalog-search-desktop"');
    const mainLayout = source.indexOf("<!-- Main Layout Container", desktopBreadcrumbs);

    expect(mobileSearch).toBeGreaterThan(mobileBreadcrumbs);
    expect(mobileSearch).toBeLessThan(desktopBreadcrumbs);
    expect(desktopSearch).toBeGreaterThan(desktopBreadcrumbs);
    expect(desktopSearch).toBeLessThan(mainLayout);
  });

  it("debounces URL-backed search and filters both cards and category navigation", () => {
    expect(source).toContain("const SEARCH_DEBOUNCE_MS = 350");
    expect(source).toContain("route.query.search");
    expect(source).toContain("filterCatalog({");
    expect(source).toContain('v-for="cat in filteredCategories"');
    expect(source).toContain(':categories="filteredCategories"');
  });

  it("clears category filters without discarding search or unrelated query state", () => {
    const clearFilterStart = source.indexOf("function clearFilter()");
    const clearFilterSource = source.slice(clearFilterStart, clearFilterStart + 220);

    expect(clearFilterSource).toContain("...route.query");
    expect(clearFilterSource).toContain("category: undefined");
    expect(clearFilterSource).toContain("subcategory: undefined");
  });

  it("distinguishes global no-results from an empty selected category", () => {
    expect(source).toContain("catalogResults.value.searchCards.length > 0");
    expect(source).toContain("No products in ${activeSubcategoryName.value}");
    expect(source).toContain("No products or categories found");
  });

  it("scrolls to top, respecting reduced motion, when the category selection changes", () => {
    const watchStart = source.indexOf(
      "watch([selectedCategorySlug, selectedSubcategorySlug]",
    );
    const watchSource = source.slice(watchStart, watchStart + 260);

    expect(watchStart).toBeGreaterThan(-1);
    expect(watchSource).toContain("prefers-reduced-motion: reduce");
    expect(watchSource).toContain("window.scrollTo({ top: 0, behavior: reduced ? \"auto\" : \"smooth\" })");
  });
});
