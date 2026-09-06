import { describe, expect, it } from "vitest";
import { getQuoteLineFinancials, getQuoteLinesTotal } from "~~/shared/utils/quoteLine";

describe("getQuoteLineFinancials", () => {
  it("prices from basePrice when there is no customized total", () => {
    const financials = getQuoteLineFinancials({ basePrice: 1000, quantity: 2 });

    expect(financials.unitPrice).toBe(1000);
    expect(financials.lineTotal).toBe(2000);
  });

  it("prefers the customized total over the price captured at add time", () => {
    const financials = getQuoteLineFinancials({ basePrice: 1000, customTotal: 1250, quantity: 2 });

    expect(financials.unitPrice).toBe(1250);
    expect(financials.lineTotal).toBe(2500);
  });

  it("prices at 0 when neither a base price nor a customized total is set", () => {
    const financials = getQuoteLineFinancials({ quantity: 3 });

    expect(financials.unitPrice).toBe(0);
    expect(financials.lineTotal).toBe(0);
  });

  it("reads the stored isPoa flag rather than inferring it from a missing price", () => {
    expect(getQuoteLineFinancials({ quantity: 1, isPoa: true }).isPoa).toBe(true);
    expect(getQuoteLineFinancials({ quantity: 1, isPoa: false }).isPoa).toBe(false);
    // No stored flag at all: a line with a price is not POA just because the flag is absent.
    expect(getQuoteLineFinancials({ quantity: 1, basePrice: 1000 }).isPoa).toBe(false);
  });

  it("does not treat a POA line's missing price as a reason to zero out its current price", () => {
    // A POA line can still carry an estimate; POA-ness and price are decided independently.
    const financials = getQuoteLineFinancials({ basePrice: 1000, isPoa: true, quantity: 1 });

    expect(financials.isPoa).toBe(true);
    expect(financials.unitPrice).toBe(1000);
  });
});

describe("getQuoteLinesTotal", () => {
  it("sums every line's current lineTotal", () => {
    const total = getQuoteLinesTotal([
      { basePrice: 1000, quantity: 2 },
      { basePrice: 500, customTotal: 750, quantity: 1 },
    ]);

    expect(total).toBe(2000 + 750);
  });

  it("includes POA lines at their current price", () => {
    const total = getQuoteLinesTotal([{ basePrice: 1000, isPoa: true, quantity: 1 }]);

    expect(total).toBe(1000);
  });

  it("is 0 for an empty Quote List", () => {
    expect(getQuoteLinesTotal([])).toBe(0);
  });
});
