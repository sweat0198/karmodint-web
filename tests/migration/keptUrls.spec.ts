import { describe, expect, it } from "vitest";
import { PRODUCT_LINE_URLS } from "../../shared/migration/keptUrls";

describe("PRODUCT_LINE_URLS", () => {
  it("lists the seven Kept URLs served by Product Line pages", () => {
    expect([...PRODUCT_LINE_URLS].sort()).toEqual([
      "/bulletproof-cabin/",
      "/grp-kiosk-cabin/",
      "/modular-buildings/",
      "/panel-cabin/",
      "/portable-cabin/",
      "/portable-cabin/portable-house/",
      "/portable-cabin/steel-cabin/",
    ]);
  });
});
