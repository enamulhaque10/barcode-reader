import { useEffect, useRef, useState } from "react";
import "./App.css";
import { upsertScannedItem } from "./barcodeUtils";

// SKU -> Model mapping is loaded from public/sku-models.csv at runtime.
// The CSV supports the header `category,sku,model` and also tolerates tab-delimited rows.

function App() {
  const [barcode, setBarcode] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [skuModelMap, setSkuModelMap] = useState({});
  const [skuMapLoaded, setSkuMapLoaded] = useState(false);

  const inputRef = useRef(null);

  const parseSkuRow = (line) => {
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

    return null;
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    // Load SKU->Model mapping from public/sku-models.csv
    const loadCsv = async () => {
      try {
        const res = await fetch("/sku-models.csv");
        if (!res.ok) {
          setSkuMapLoaded(true); // allow searches even if file not found
          return;
        }
        const text = await res.text();
        const map = {};
        const lines = text.split(/\r?\n/);

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          if (i === 0 && /^(category\s*,\s*sku\s*,\s*model|sku\s*,\s*model)/i.test(line)) {
            continue;
          }

          const row = parseSkuRow(line);
          if (!row || !row.sku) continue;

          map[row.sku] = {
            model: row.model,
            category: row.category || "Unknown",
          };
        }

        setSkuModelMap(map);
        setSkuMapLoaded(true);
      } catch (err) {
        console.error("Failed to load sku-models.csv:", err);
        setSkuMapLoaded(true); // avoid blocking forever — allow searches though map may be empty
      }
    };

    loadCsv();
  }, []);

  const handleSearch = async () => {
    const raw = barcode.trim();

    if (!raw) {
      setMessage("Please scan or enter a barcode.");
      return;
    }

    if (!skuMapLoaded) {
      setMessage("SKU mapping is still loading — please wait a moment.");
      return;
    }

    if (skuMapLoaded && Object.keys(skuModelMap).length === 0) {
      setMessage("SKU mapping is empty or failed to load. Check public/sku-models.csv.");
      return;
    }

    setLoading(true);
    setMessage("");

    // Support single barcode or multiple comma/newline-separated values
    const codes = raw
      .split(/[ ,\n]/)
      .map((c) => c.trim())
      .filter(Boolean);

    setItems((prev) => {
      let updated = prev;
      for (const code of codes) {
        const skuKey = code.slice(0, 10);
        const skuEntry = skuModelMap[skuKey];
        const modelName = skuEntry?.model || "Model not found";
        const categoryName = skuEntry?.category || "Unknown";
        updated = upsertScannedItem(updated, code, skuKey, modelName, categoryName);
      }
      return updated;
    });

    setBarcode("");
    setLoading(false);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleKeyDown = (e) => {
    // For textarea: submit on Ctrl+Enter to allow multi-line input
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSearch();
    }
  };

  const clearList = () => {
    setItems([]);
    setMessage("");
    inputRef.current?.focus();
  };

  const sortedItems = [...items].sort((a, b) => {
    const catA = String(a.category || "Unknown").toLowerCase();
    const catB = String(b.category || "Unknown").toLowerCase();

    if (catA !== catB) {
      return catA.localeCompare(catB);
    }

    const modelA = String(a.model || a.description || "").toLowerCase();
    const modelB = String(b.model || b.description || "").toLowerCase();
    return modelA.localeCompare(modelB);
  });

  return (
    <div className="app">
      <div className="container">

        {/* Header */}
        <header className="header">
          <h1>Barcode Reader</h1>
          <p>Scan a barcode to find product information</p>
        </header>

        {/* Barcode Input */}
        <section className="scanner-card">
          <label htmlFor="barcode">Barcode</label>

          <div className="input-group">
            <textarea
              ref={inputRef}
              id="barcode"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter barcode(s) here — separate multiple barcodes with commas. Use Ctrl+Enter to submit."
              rows={3}
              autoComplete="off"
              autoFocus
            />

            <button
              onClick={handleSearch}
              disabled={loading || !skuMapLoaded}
            >
              {loading ? "Validating..." : skuMapLoaded ? "Validate" : "Loading map..."}
            </button>
          </div>

          {message && (
            <div className="message">
              {message}
            </div>
          )}
        </section>

        {/* Results */}
        <section className="results-card">

          <div className="results-header">
            <div>
              <h2>Scanned Items</h2>
              <span>{items.length} item(s)</span>
            </div>

            <button
              className="clear-button"
              onClick={clearList}
            >
              Clear
            </button>
          </div>

          {items.length === 0 ? (
            <div className="empty">
              <p>No barcode scanned yet.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Barcode</th>
                    <th>Category</th>
                    <th>Model</th>
                    <th>Quantity</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {sortedItems.map((item, index) => (
                    <tr key={`${item.barcode}-${index}`}>
                      <td>{index + 1}</td>
                      <td className="barcode">
                        {item.barcode}
                      </td>
                      <td>{item.category || "Unknown"}</td>
                      <td>{item.model || item.description || "Model not found"}</td>
                      <td>{item.quantity}</td>
                      <td>
                        <span
                          className={
                            item.status === "Found"
                              ? "status found"
                              : "status not-found"
                          }
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </section>
      </div>
    </div>
  );
}

export default App;