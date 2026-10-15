import test from "node:test";
import assert from "node:assert/strict";

import { createScannedItemsPdf } from "./pdfExport.js";

test("createScannedItemsPdf retains long barcodes as exact text", () => {
  const pdf = createScannedItemsPdf([
    {
      barcode: "7400000039262053840301",
      category: "REF",
      model: "Product model",
      quantity: 1,
      status: "Found",
    },
  ]).output();

  assert.ok(pdf.startsWith("%PDF-"));
  assert.ok(pdf.includes("(7400000039262053840301)"));
});

test("createScannedItemsPdf includes column headers", () => {
  const pdf = createScannedItemsPdf([
    {
      barcode: "123",
      category: "REF",
      model: "Product model",
      quantity: 1,
      status: "Found",
    },
  ]).output();

  for (const title of ["#", "Barcode", "Category", "Model", "Quantity", "Status"]) {
    assert.ok(pdf.includes(`(${title}) Tj`), `Missing PDF column header: ${title}`);
  }
});

test("createScannedItemsPdf paginates long item lists", () => {
  const items = Array.from({ length: 100 }, (_, index) => ({
    barcode: String(index + 1),
    category: "REF",
    model: "Product model",
    quantity: 1,
    status: "Found",
  }));
  const pdf = createScannedItemsPdf(items).output();
  const pageCount = (pdf.match(/\(Page \d+ of \d+\)/g) ?? []).length;
  const headerFillCount = (pdf.match(/0\.15 0\.21 0\.33 rg/g) ?? []).length;

  assert.match(pdf, /\(Page 2 of \d+\)/);
  assert.ok(headerFillCount >= pageCount * 6);
  for (const title of ["#", "Barcode", "Category", "Model", "Quantity", "Status"]) {
    assert.equal((pdf.match(new RegExp(`\\(${title}\\) Tj`, "g")) ?? []).length, pageCount);
  }
});
