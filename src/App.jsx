import { useEffect, useRef, useState } from "react";
import "./App.css";
import { upsertScannedItem } from "./barcodeUtils";

// SKU -> Model mapping is loaded from public/sku-models.csv at runtime.
// Place a CSV file at `public/sku-models.csv` with a header `sku,model`.

function App() {
  const [barcode, setBarcode] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [skuModelMap, setSkuModelMap] = useState({});
  const [skuMapLoaded, setSkuMapLoaded] = useState(false);

  const inputRef = useRef(null);

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
          // skip header if present
          if (i === 0 && /^\s*sku\s*,/i.test(line)) continue;
          // split on first comma to allow commas in model name
          const idx = line.indexOf(",");
          if (idx === -1) continue;
          const sku = line.slice(0, idx).replace(/"/g, "").trim();
          const model = line.slice(idx + 1).replace(/"/g, "").trim();
          if (sku) map[sku] = model;
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

    // Support single barcode or multiple comma-separated values
    const codes = raw
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    setItems((prev) => {
      let updated = prev;
      for (const code of codes) {
        const skuKey = code.slice(0, 10);
        const modelName = skuModelMap[skuKey] || "Model not found";
        updated = upsertScannedItem(updated, code, skuKey, modelName);
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
                    {/* <th>SKU</th> */}
                    <th>Model</th>
                    <th>Quantity</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item, index) => (
                    <tr key={`${item.barcode}-${index}`}>
                      <td>{index + 1}</td>
                      <td className="barcode">
                        {item.barcode}
                      </td>
                      {/* <td>{item.sku}</td> */}
                      <td>{item.description}</td>
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