export function parseSkuRow(line) {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const tabColumns = trimmed
    .split("\t")
    .map((part) => part.replace(/^"|"$/g, "").trim())
    .filter(Boolean);

  if (tabColumns.length >= 3) {
    return {
      category: tabColumns[0],
      sku: tabColumns[1],
      model: tabColumns.slice(2).join(","),
    };
  }

  const commaColumns = trimmed
    .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
    .map((part) => part.replace(/^"|"$/g, "").trim());

  if (commaColumns.length >= 3) {
    const [category, sku, ...modelParts] = commaColumns;
    return {
      category: category || "Unknown",
      sku: sku || "",
      model: modelParts.join(","),
    };
  }

  const spaceColumns = trimmed
    .split(/\s+/)
    .map((part) => part.replace(/^"|"$/g, "").trim())
    .filter(Boolean);

  if (spaceColumns.length >= 3) {
    const [category, sku, ...modelParts] = spaceColumns;
    return {
      category: category || "Unknown",
      sku: sku || "",
      model: modelParts.join(" "),
    };
  }

  return null;
}

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

export function filterScannedItems(items, query = "") {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return items;
  }

  return items.filter((item) => {
    const haystack = [
      item.barcode,
      item.sku,
      item.model,
      item.description,
      item.category,
      item.status,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}

export function upsertScannedItem(prevItems, code, skuKey, modelName, category = "Unknown") {
  const existingIndex = prevItems.findIndex((item) => item.barcode === code);
  console.log(existingIndex, 'existingIndex');

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
