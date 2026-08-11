import { useEffect, useRef, useState } from "react";
import "./App.css";
import { upsertScannedItem } from "./barcodeUtils";

const SKU_MODEL_MAP = {
  "7400000001": "SRREF-SS100-FBDS260V",
  "7400000002": "SRREF-SS500-FTDS230Z-BG",
  "7400000003": "SRREF-SS100-FTDS230V",
  "7400000004": "SRREF-SS300-FTDS230-BG",
  "7400000005": "SRREF-SS500-FBDS260Z-BG",
  "7400000006": "SRREF-SS300-FBDS260-BG",
  "7400000007": "SRREF-SS300-FBDS260-RG",
  "7400000008": "SRREF-SS500-FBDS260Z-RG",
  "7400000009": "SRREF-SS300-FTDS230-RG",
  "7400000010": "SRREF-SS500-FTDS230Z-RG",
  "7400000013": "SRREF-SS100-FTDS185V",
  "7400000018": "SRREF-SS300-FTDS200-RG",
  "7400000019": "SRREF-SS300-FTDS200-BUG",
  "7400000020": "SRREF-SS100-FTDS200V",
  "7400000021": "SRREF-SS100-FTDS155V",
  "7400000022": "SRREF-SS100-FBDS185V",
  "7400000023": "SRREF-SS100-FBDS225V",
  "7400000024": "SRREF-SS500-FBDS225Z-RG",
  "7400000025": "SRREF-SS500-FBDS225Z-BG",
  "7400000026": "SRREF-SS300-FBDS225-BG",
  "7400000028": "SRREF-SS300-FBDS225-RG",
  "7400000032": "SRREF-SS300-FTDS277-RG",
  "7400000033": "SRREF-SS300-FTDS257-RG",
  "7400000034": "SRREF-SS300-FTDS257-BG",
  "7400000036": "SRREF-SS300-FTDS277-BG",
  "7400000038": "BOREF-BS5-FTDS23Z-BG",
  "7400000039": "BOREF-BS5-FBDS26Z-BG",
  "7400000040": "SRREF-SS500-FTDS257ZWF-RG",
  "7400000041": "SRREF-SS500-FTDS277ZWF-BG",
  "7400000042": "SRREF-SS500-FTDS277ZWF-RG",
  "7400000043": "SRREF-SS500-FTDS257ZWF-BG",
  "7400000044": "BOREF-B3RDSB330ZGB",
  "7400000045": "BOREF-B3RDSB330ZGB",
  "7400000046": "BOREF-B3RDSB330AGB",
  "7400000047": "BOREF-B3RDSB355AGB",
  "7400000048": "BOREF-B7RDSS330AIDDBG",
  "7400000049": "BOREF-B7RDSS355AIDDBG",
  "7400000050": "BOREF-B5RDSB257AGB",
  "7400000051": "BOREF-B5RDSB277AGB",
  "7400000052": "SRREF-SS300-FBDS185NS-RG",
  "7400000053": "SRREF-SS300-FBDS185NS-BG",
  "7400000054": "SRREF-SS100-FBDS185NSV",
  "7400000058": "SRREF-SS300-FTDS185NS-BUG",
  "7400000059": "SRREF-SS300-FTDS185NS-BG",
  "7400000060": "SRREF-SS300-FTDS185NSV",
  "7400000061": "SRREF-SS300-FTDS155NSL-RG",
  "7400000062": "SRREF-SS300-FTDS155NSL-BG",
  "7400000063": "SRREF-SS100-FTDS155NSV",
  "7400000065": "BOREF-B500-FBDS225ZBG",
  "7400000068": "BOREF-B500-FTDS277ABG",
  "7400000069": "BOREF-B500-FTDS257ABG",
  "7400000072": "SRREF-SS300-FTDS157-WE-RG",
  "7400000073": "SRREF-SS300-FTDS185-WE-RG",
  "7400000074": "SRREF-SS300-FBDS185-WE-RG",
  "7400000075": "SRREF-SS300-FTDS200-WE-RG",
  "7400000076": "SRREF-SS300-FTDS230-WE-MG",
  "7400000077": "SRREF-SS300-FTDS277-WE-MG",
  "7400000078": "SRREF-SS300-FBDS260-WE-MG",
  "7400000079": "SRREFSS300-FBDS225-WE-MG",
  "7400000082": "BOREF-B5RDNS325ZISG",
  "7400000093": "SRREF-SS300-FTDS230-NBG",
  "7400000094": "SRREF-SS300-FTDS230-NRG",
  "7400000095": "SRREF-SS300-FBDS260-NBG",
  "7400000096": "SRREF-SS300-FBDS225-NBG",
  "7400000098": "SRREF-SS300-FTDS277-NBG",
  "7400000100": "SRREF-SS300-FTDS185-NBLK",
  "7400000101": "SRREF-SS300-FTDS155-NRG",
  "7400000103": "SRREF-SS300-FTDS277-NRG",
  "7400000104": "SRREF-SS300-FTDS200-NBG",
  "7400000105": "SRREF-SS300-FTDS200-NRG",
  "8330173600": "SRTV-SLE32E3AGOTV",
  "8330143600": "SRTV-SLE32E3AHDTV",
  "8330253600": "SRTV-SLE32GD6100TV",
  "8330313600": "SRTV-SLE32GP6100TV",
  "8330453600": "SRTV-SLE32V4NSTV",
  "8330203600": "SRTV-SLE43G22GOTV",
  "8330263600": "SRTV-SLE43GA5000TV",
  "8330303600": "SRTV-SLE43GP5000TV",
  "8330273600": "SRTV-SLE43GU5000TV",
  "8330213600": "SRTV-SLE50G22GOTV",
  "8330283600": "SRTV-SLE50GU5000TV",
  "8330293600": "SRTV-SLE55GU5000TV",
  "8330103200": "BOTV-BU65VH5QGOTV",
  "8330093200": "BOTV-BU55VH5QGOTV",
  "8330083200": "BOTV-BU50VH5QGOTV",
  "8330073200": "BOTV-BU43VH5QGOTV",
  "8400010018": "SRGR-SINGER-ELITE-RED",
  "8400010211": "SRGR-SINGER-OPTIMA-BLK",
  "8400010212": "SRGR-SINGER-OPTIMA-LITE-M",
  "8400010213": "SRGR-SINGER-OPTIMA-PRP",
  "8400010021": "SRGR-SINGER-PRO-RED",
  "8400010195": "SRGR-SINGER-ULTIMA-MRN",
  "8400010020": "SRGR-SINGER-PRO-BLUE",
  "8400000766": "SRGR-SINGER-ALPHA-GOLD",
  "8400000765": "SRGR-SINGER-ALPHA-MIX",
  "8400000767": "SRGR-SINGER-PRIME-RED",
  "8400010619": "SRGR-SINGER-GRINDPRO-BLK",
  "8400010620": "SRGR-SINGER-GRINDMASTER-B",
  "8400010621": "SRGR-SINGER-POWERGRIND-GB",
  "8400010498": "BOMO-MGF30330S",
  "8400010497": "BOMO-MCF32410X",
  "8400010226": "SRMO-SMW20MDSOLP",
  "8400010411": "SRMO-SMW23MSOLP",
  "8400010044": "SRMO-SMW23GA9LP",
  "8400010207": "SRMO-SMW25EMSOLP",
  "8400010241": "SRMO-SMW25GCHLP",
  "8400010050": "SRMO-SMW30AMSOLP",
  "8400010204": "SRMO-SMW30GCB8LP",
  "8400010203": "SRMO-SMWG30G6LP",
  "8400010206": "SRMO-SMW30GC2NLP",
  "8400010227": "SRMO-SMW35GCB5LP",
  "8400010545": "SRMO-SMW35GCB6LP",
  "8400010205": "SRMO-SMW930MCOLP",
  "8400010533": "SREI-SID-2412-2386A-OR-L",
  "8700000973": "BOREF-B3RCNS34HXB",
  "8700000974": "BOREF-B3RCNS37HXB",
  "8700000971": "BOREF-B5RCNS34HUG",
  "8700000972": "BOREF-B5RCNS37HUG",
  "8700001007": "BOREF-B5RCNS40HUG",
  "8700001008": "BOREF-B3RCNS40HXB",
  "8700000864": "BOREF-B3RDNR37ZGB",
  "8700000866": "BOREF-B3RDNR40ZGB",
  "8700000865": "BOREF-B5RDNR37ZGB",
  "8700000867": "BOREF-B5RDNR40ZGB",
  "8400010503": "SRREF-S100-BD-170-GY",
  "8400010502": "SRREF-S100-BD-170-DGY",
  "8400010504": "SRREF-S100-BD-170-DRG",
  "8997503600": "SRREF-S100-BD-170-MY",
  "8997473600": "SRREF-S100-BD-170-RG",
  "8400010499": "SRREF-SINGER-ICF-256A-LP",
  "8997533600": "SRREF-S300-GT-211-BL",
  "8998253600": "SRREF-SINGERBD-290GLGY-LP",
  "8400010501": "SRREF-S100-BD-230-DGY",
  "8998233600": "SRREF-SC-250BX-LP",
  "8400010500": "SRREF-S100-BD-230-GY",
  "8997483600": "SRREF-S100-BD-230-RG",
  "8997513600": "SRREF-S100-BD-230-MY",
  "8998243600": "SRREF-SINGERBD-251GLGY-LP",
  "8400010623": "SRREF-S100-BD-230-DRG",
  "8400010644": "SRREF-S300-GT-150-DGG",
  "8400010645": "SRREF-S300-GT-211-DGG",
  "8783553600": "SRWM-S300ATL100ISMJG1",
  "8783693600": "SRWM-S300ATL100DSMJG1",
  "8783713600": "SRWM-S100ATL70ISMJS1",
  "8783673600": "SRWM-S300ATL70ISMJG1",
  "8783683600": "SRWM-S300ATL90ISMJG1 ",
  "8400010520": "SRWM-S100ATT70ATPKB1LP",
  "8400010521": "SRWM-S100ATT90ATPKM1LP",
  "8400010544": "SRWM-S100ATT90ATPKB1LP",
  "8400010522": "SRWM-S300ATT90ATPKF1LP",
  "8783753600": "SRWM-S300ATT110ATPKF1LP",
  "8400010640": "BOWM-BTL09IP1COD",
  "8400010639": "BOWM-BTL07IP1COD",
  "8400010546": "BOWM-BTL12DT1COD",
  "8400010642": "BOWM-BTL10DT1COD",
  "8400010493": "BOAC-BNVOH180/BNVOH181",
  "8400010495": "BOAC-BNVOHH240/BNVOHH241",
  "8400010197": "SRAC-SAS12CBR32LVSGRIH-CO",
  "8400010198": "SRAC-SAS18CBR32LVSGRIH-CO",
  "8400010199": "SRAC-SAS22CBR32LVSGRIH-CO",
  "7440000001": "SRAC-SAS12CBRX32LVSGRIHCO",
  "7440000002": "SRAC-SAS12CBRX32LVSGRIHCO",
  "7440000003": "SRAC-SAS18CBRX32LVSGRIHCO",
  "7440000004": "SRAC-SAS18CBRX32LVSGRIHCO",
  "7440000005": "SRAC-SAS24CBRX32LVSGRIHCO",
  "7440000006": "SRAC-SAS24CBRX32LVSGRIHCO",
  "7440000007": "SRAC-SAS12CEXR32LVSGRIHCO",
  "7440000008": "SRAC-SAS12CEXR32LVSGRIHCO",
  "7440000009": "SRAC-SAS18CEXR32LVSGRIHCO",
  "7440000010": "SRAC-SAS18CEXR32LVSGRIHCO",
  "7440000011": "SRAC-SAS24CEXR32LVSGRIHCO",
  "7440000012": "SRAC-SAS24CEXR32LVSGRIHCO",
  "7440000019": "BOAC-BNVOD185/BNVOD186",
  "7440000020": "BOAC-BNVOD185/BNVOD186",
  "7440000021": "BOAC-BNVOH185/BNVOH186",
  "7440000022": "BOAC-BNVOH185/BNVOH186",
  "7440000023": "BOAC-BNVOH245/BNVOH246",
  "7440000024": "BOAC-BNVOH245/BNVOH246",
  "8770073700": "SRGB - 24SX2-SS-L",
  "8770093700": "SRGB - 24SX2-GT-L",
  "8770083700": "SRGB-24SX2-SS-N",
  "8770103700": "SRGB-24SX2-GT-N"
};

function App() {
  const [barcode, setBarcode] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = async () => {
    const code = barcode.trim();

    if (!code) {
      setMessage("Please scan or enter a barcode.");
      return;
    }

    setLoading(true);
    setMessage("");

    const skuKey = code.slice(0, 10);
    const modelName = SKU_MODEL_MAP[skuKey] || "Model not found";

    setItems((prev) => upsertScannedItem(prev, code, skuKey, modelName));

    setBarcode("");
    setLoading(false);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
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
            <input
              ref={inputRef}
              id="barcode"
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Scan barcode here..."
              autoComplete="off"
              autoFocus
            />

            <button
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
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
                    <th>SKU</th>
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
                      <td>{item.sku}</td>
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