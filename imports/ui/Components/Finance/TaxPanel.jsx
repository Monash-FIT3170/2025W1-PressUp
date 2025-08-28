import React, { useMemo, useState, useCallback, useEffect } from "react";
import { Meteor } from "meteor/meteor";
import "./Finance.css";

/** 
 * Get FY options from a given start year up to current FY (inclusive). 
 */
function buildFinancialYearOptions(startFromYear) {
  if (typeof startFromYear !== "number" || !Number.isFinite(startFromYear)) {
    throw new Error("buildFinancialYearOptions: startFromYear must be a number");
  }
  const now = new Date();
  const currentCalendarYear = now.getFullYear();
  const currentMonthIndex = now.getMonth(); // 0 = Jan
  const currentFyEndYear = currentMonthIndex >= 6 ? currentCalendarYear + 1 : currentCalendarYear;

  const options = [];
  for (let endYear = currentFyEndYear; endYear >= startFromYear + 1; endYear -= 1) {
    const startYear = endYear - 1;
    options.push({ label: `${startYear}–${endYear}`, startYear, endYear });
  }
  return options;
}

/** 
 * Export options.
 */
const EXPORT_CONFIG = {
  orders_csv: {
    method: "finance.export.ordersCSVForFY",
    mimeType: "text/csv;charset=utf-8",
    extension: "csv",
    isBase64: false,
  },
  orders_pdf: {
    method: "finance.export.ordersPDFForFY",
    mimeType: "application/pdf",
    extension: "pdf",
    isBase64: true,
  },
};

/** 
 * Fetch and download the specified export type.
 */
async function fetchAndDownloadExport({ exportType, startYear, endYear, baseFilename }) {
  const config = EXPORT_CONFIG[exportType];
  if (!config) throw new Error(`Unsupported export type: ${exportType}`);

  const result = await Meteor.callAsync(config.method, startYear, endYear);

  let blob;
  if (config.isBase64) {
    // Base64 to Blob (for PDF).
    const binaryString = atob(result);
    const byteArray = new Uint8Array([...binaryString].map((ch) => ch.charCodeAt(0)));
    blob = new Blob([byteArray], { type: config.mimeType });
  } else {
    // Raw string to Blob (for CSV).
    blob = new Blob([result], { type: config.mimeType });
  }

  // File properties.
  const filename = `${baseFilename}.${config.extension}`;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function TaxPanel({ startFromYear = 2025 }) {
  const financialYearOptions = useMemo(
    () => buildFinancialYearOptions(startFromYear),
    [startFromYear]
  );

  const [selectedFyIndex, setSelectedFyIndex] = useState(financialYearOptions.length ? 0 : -1);
  useEffect(() => {
    setSelectedFyIndex(financialYearOptions.length ? 0 : -1);
  }, [financialYearOptions.length]);

  const [exportType, setExportType] = useState("orders_csv");
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const selectedFy = selectedFyIndex >= 0 ? financialYearOptions[selectedFyIndex] : undefined;
  const isFormReady = Boolean(selectedFy && exportType);

  const handleDownload = useCallback(async () => {
    if (!selectedFy) return;
    setErrorMessage("");
    setIsDownloading(true);
    try {
      await fetchAndDownloadExport({
        exportType,
        startYear: selectedFy.startYear,
        endYear: selectedFy.endYear,
        baseFilename: `orders-${selectedFy.startYear}-${selectedFy.endYear}`,
      });
    } catch (error) {
      console.error("[TaxPanel] download failed:", error);
      setErrorMessage(error?.reason || error?.message || "Failed to generate export.");
    } finally {
      setIsDownloading(false);
    }
  }, [exportType, selectedFy]);

  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 520 }}>
      <h2>Tax Export</h2>

      <label style={{ display: "grid", gap: 6 }}>
        <span>Financial Year</span>
        <select
          value={selectedFyIndex}
          onChange={(e) => setSelectedFyIndex(Number(e.target.value))}
          disabled={!financialYearOptions.length}
          aria-label="Select financial year"
        >
          {financialYearOptions.map((option, index) => (
            <option key={option.label} value={index}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span>Export Type</span>
        <select
          value={exportType}
          onChange={(e) => setExportType(e.target.value)}
          aria-label="Select export type"
        >
          <option value="orders_csv">Orders (CSV)</option>
          <option value="orders_pdf">Orders (PDF)</option>
        </select>
      </label>

      <div className="finance-actions">
        <button
          className="finance-download-button"
          onClick={handleDownload}
          disabled={!isFormReady || isDownloading}
          aria-disabled={!isFormReady || isDownloading}
        >
          {isDownloading ? "Preparing…" : "Download"}
        </button>
      </div>

      {errorMessage && (
        <div style={{ color: "#b00020", fontSize: 14 }}>{errorMessage}</div>
      )}
    </div>
  );
}