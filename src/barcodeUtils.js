export function buildScannedItem(code, skuKey, modelName) {
  return {
    barcode: code,
    sku: skuKey,
    description: modelName,
    quantity: 1,
    status: modelName === "Model not found" ? "Not Found" : "Found",
  };
}

export function upsertScannedItem(prevItems, code, skuKey, modelName) {
  const existingIndex = prevItems.findIndex((item) => item.barcode === code);

  if (existingIndex === -1) {
    return [buildScannedItem(code, skuKey, modelName), ...prevItems];
  }

  return prevItems.map((item, index) =>
    index === existingIndex
      ? { ...item, quantity: Number(item.quantity || 0) + 1 }
      : item
  );
}
