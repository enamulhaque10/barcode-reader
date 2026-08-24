export function buildScannedItem(code, skuKey, modelName, category = "Unknown") {
  return {
    barcode: code,
    sku: skuKey,
    model: modelName,
    description: modelName,
    category,
    quantity: 1,
    status: modelName === "Model not found" ? "Not Found" : "Found",
  };
}

export function upsertScannedItem(prevItems, code, skuKey, modelName, category = "Unknown") {
  const existingIndex = prevItems.findIndex((item) => item.barcode === code);

  if (existingIndex === -1) {
    return [buildScannedItem(code, skuKey, modelName, category), ...prevItems];
  }

  return prevItems.map((item, index) =>
    index === existingIndex
      ? {
          ...item,
          model: item.model || modelName,
          description: item.description || modelName,
          category: item.category || category,
          quantity: Number(item.quantity || 0) + 1,
        }
      : item
  );
}
