import test from 'node:test';
import assert from 'node:assert/strict';

import { buildScannedItem, upsertScannedItem } from './barcodeUtils.js';

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
