import { jsPDF } from "jspdf";

const columns = [
  { title: "#", width: 30 },
  { title: "Barcode", width: 205 },
  { title: "Category", width: 90 },
  { title: "Model", width: 330 },
  { title: "Quantity", width: 60 },
  { title: "Status", width: 70 },
];

export function createScannedItemsPdf(items) {
  const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 28;
  const tableWidth = columns.reduce((total, column) => total + column.width, 0);
  const tableLeft = (pageWidth - tableWidth) / 2;
  const headerHeight = 22;
  const rowPadding = 6;
  const lineHeight = 12;
  const bottomLimit = pageHeight - 38;
  let y = 72;

  const drawTableHeader = () => {
    pdf.setDrawColor(37, 54, 83);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    let x = tableLeft;
    for (const column of columns) {
      pdf.setFillColor(37, 54, 83);
      pdf.rect(x, y, column.width, headerHeight, "FD");
      pdf.setTextColor(255, 255, 255);
      pdf.text(column.title, x + 6, y + 14);
      x += column.width;
    }
    y += headerHeight;
    pdf.setTextColor(35, 39, 47);
  };

  const drawPageHeading = () => {
    pdf.setTextColor(37, 54, 83);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text("Scanned Items", margin, 30);
    pdf.setTextColor(90, 97, 108);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text(
      `Exported ${new Date().toLocaleDateString()} - ${items.length} item(s)`,
      margin,
      47
    );
    y = 60;
    drawTableHeader();
  };

  drawPageHeading();

  items.forEach((item, index) => {
    const values = [
      String(index + 1),
      String(item.barcode ?? ""),
      String(item.category || "Unknown"),
      String(item.model || item.description || "Model not found"),
      String(item.quantity ?? ""),
      String(item.status ?? ""),
    ];
    const cellLines = values.map((value, columnIndex) =>
      pdf.splitTextToSize(value, columns[columnIndex].width - 12)
    );
    const rowHeight = Math.max(
      lineHeight + rowPadding * 2,
      ...cellLines.map((lines) => lines.length * lineHeight + rowPadding * 2)
    );

    if (y + rowHeight > bottomLimit) {
      pdf.addPage();
      drawPageHeading();
    }

    let x = tableLeft;
    cellLines.forEach((lines, columnIndex) => {
      pdf.setFillColor(index % 2 === 0 ? 255 : 245, index % 2 === 0 ? 255 : 247, index % 2 === 0 ? 255 : 250);
      pdf.setDrawColor(210, 216, 224);
      pdf.rect(x, y, columns[columnIndex].width, rowHeight, "FD");
      pdf.setTextColor(35, 39, 47);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      pdf.text(lines, x + 6, y + rowPadding + 8);
      x += columns[columnIndex].width;
    });
    y += rowHeight;
  });

  const pageCount = pdf.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    pdf.setPage(page);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(110, 116, 125);
    pdf.text(`Page ${page} of ${pageCount}`, pageWidth - margin, pageHeight - 16, {
      align: "right",
    });
  }

  return pdf;
}
