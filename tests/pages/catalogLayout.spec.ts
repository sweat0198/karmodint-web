import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("catalog desktop layout", () => {
  const source = fs.readFileSync(
    path.resolve(process.cwd(), "app/pages/catalog/index.vue"),
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
});
