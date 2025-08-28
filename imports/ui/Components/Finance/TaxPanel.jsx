import React, { useMemo, useState, useCallback } from "react";
import { Meteor } from "meteor/meteor";
import "./Finance.css";

function buildFinancialYearOptions(startYear) {
  const now = new Date();
  const calendarYear = now.getFullYear();
  const monthIndex = now.getMonth();
  const currentFyEndYear = monthIndex >= 6 ? calendarYear + 1 : calendarYear;

  const options = [];

  for (let endYear = currentFyEndYear; endYear > startYear; endYear -= 1) {
    const fyStartYear = endYear - 1;
    options.push({
      label: `${fyStartYear}–${endYear}`,
      startYear: fyStartYear,
      endYear: endYear,
    });
  }

  return options;
}

const EXPORT_TYPES = [
  { value: "orders_csv", label: "Orders (CSV)" },
];

function triggerDownload({ content, filename, mimeType = "text/plain;charset=utf-8" }) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function TaxPanel() {
  const financialYearOptions = useMemo(() => buildFinancialYearOptions(2025), []);
  const [selectedFyIndex, setSelectedFyIndex] = useState(0);
  const [exportType, setExportType] = useState(EXPORT_TYPES[0].value);
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const selectedFy = financialYearOptions[selectedFyIndex];

  const handleDownload = useCallback(async () => {
    if (!selectedFy) return;

    setErrorMessage("");
    setIsDownloading(true);

    try {
      if (exportType !== "orders_csv") {
        setErrorMessage("Unsupported export type.");
        return;
      }

      const csv = await Meteor.callAsync(
        "finance.export.ordersCSVForFY",
        selectedFy.startYear,
        selectedFy.endYear
      );

      triggerDownload({
        content: csv,
        filename: `orders-${selectedFy.startYear}-${selectedFy.endYear}.csv`,
        mimeType: "text/csv;charset=utf-8",
      });
    } catch (error) {
      console.error("[TaxPanel] download failed:", error);
      setErrorMessage(error?.reason || error?.message || "Failed to generate export.");
    } finally {
      setIsDownloading(false);
    }
  }, [exportType, selectedFy]);

  const isFormReady = Boolean(selectedFy && exportType);

  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 520 }}>
      <h2>Tax Export</h2>

      <label style={{ display: "grid", gap: 6 }}>
        <span>Financial Year</span>
        <select
          value={selectedFyIndex}
          onChange={(e) => setSelectedFyIndex(Number(e.target.value))}
        >
          {financialYearOptions.map((option, index) => (
            <option key={option.label} value={index}>
              {option.label}
            </option>
          ))}
        </select>
        <span style={{ color: "#888", fontSize: 12 }}>AU FY runs 1 Jul → 30 Jun</span>
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span>Export Type</span>
        <select
          value={exportType}
          onChange={(e) => setExportType(e.target.value)}
        >
          {EXPORT_TYPES.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <div className="finance-actions">
        <button
          className="finance-download-button"
          onClick={handleDownload}
          disabled={!isFormReady || isDownloading}
          aria-disabled={!isFormReady || isDownloading}
        >
          {isDownloading ? "Preparing…" : "Download CSV"}
        </button>
      </div>

      {errorMessage && (
        <div style={{ color: "#b00020", fontSize: 14 }}>{errorMessage}</div>
      )}
    </div>
  );
}