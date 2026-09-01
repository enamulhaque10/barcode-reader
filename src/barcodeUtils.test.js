import test from 'node:test';
import assert from 'node:assert/strict';

import { buildScannedItem, filterScannedItems, parseSkuRow, upsertScannedItem } from './barcodeUtils.js';

test('buildScannedItem includes the category and keeps the found status', () => {
  const item = buildScannedItem('1234567890', '1234567890', 'TV Model', 'TV');

  assert.equal(item.category, 'TV');
  assert.equal(item.description, 'TV Model');
  assert.equal(item.status, 'Found');
});

test('upsertScannedItem keeps the category when a duplicate is scanned', () => {
  const initial = [buildScannedItem('1234567890', '1234567890', 'TV Model', 'TV')];
  const updated = upsertScannedItem(initial, '1234567890', '1234567890', 'TV Model', 'TV');

  assert.equal(updated[0].quantity, 2);
  assert.equal(updated[0].category, 'TV');
});

test('filterScannedItems matches barcode, category and model text', () => {
  const items = [
    buildScannedItem('1001', '1001', 'Living Room TV', 'Electronics'),
    buildScannedItem('2002', '2002', 'Office Chair', 'Furniture'),
  ];

  const result = filterScannedItems(items, 'chair');

  assert.deepEqual(result.map((item) => item.barcode), ['2002']);
});

test('parseSkuRow supports space-delimited rows like REF 7400000014 SRREF-SS300-FBDS185-RG', () => {
  const row = parseSkuRow('REF 7400000014  SRREF-SS300-FBDS185-RG');

  assert.deepEqual(row, {
    category: 'REF',
    sku: '7400000014',
    model: 'SRREF-SS300-FBDS185-RG',
  });
});

test('parseSkuRow preserves the full model when the file contains legacy space-separated rows', () => {
  const row = parseSkuRow('REF 7400000014  SRREF-SS300-FBDS185-RG');

  assert.equal(row.model, 'SRREF-SS300-FBDS185-RG');
  assert.equal(row.category, 'REF');
  assert.equal(row.sku, '7400000014');
});
