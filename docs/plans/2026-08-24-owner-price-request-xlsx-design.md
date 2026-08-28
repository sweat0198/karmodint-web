# Owner Price Request XLSX Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Generate an Excel workbook that lets the business owner enter one price per product size while preserving category structure.

**Architecture:** Extend the existing Sanity export script with a second output projection. The JSON export remains unchanged; a workbook adds one owner-facing sheet with one row per size, sorted by category and product, plus editable price and notes columns.

**Tech Stack:** TypeScript via Jiti, Sanity client, ExcelJS.

---

### Task 1: Add workbook generation

**Files:**
- Modify: `scripts/catalogue/export-products-by-size.ts`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

Steps:

1. Add ExcelJS dependency.
2. Create `Price Request` worksheet with columns for category, product, slug, size, dimensions, current Sanity price, POA status, owner price, currency, and notes.
3. Flatten one row per size, sort category → product → size, freeze header row, enable filters, format editable cells, and add a legend/instructions area.
4. Write `sanity/exports/product-price-request.xlsx` alongside existing JSON.
5. Include editable `Owner Height (m)` and `Owner Weight (kg)` columns; leave them blank when source data is missing or uses the `0` weight sentinel.

### Task 2: Verify output

**Files:**
- Test: `scripts/catalogue/export-products-by-size.ts` execution output

Steps:

1. Run exporter against configured Sanity dataset.
2. Confirm workbook opens as an XLSX ZIP and contains 28 size rows.
3. Confirm all category/product groupings and editable price columns exist.
4. Confirm missing height/weight cells are blank and highlighted for owner input.
