import React, { useMemo, useState } from "react";

function computeFYs(count = 5) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const currentEndYear = m >= 6 ? y + 1 : y;
  const list = [];

  for (let i = 0; i < count; i++) {
    const endYear = currentEndYear - i;
    const startYear = endYear - 1;
    list.push({ label: `${startYear}–${endYear}`, startYear, endYear });
  }

  return list;
}

const EXPORT_TYPES = [
  { value: "summary_csv", label: "Summary (CSV)" },
  { value: "orders_csv", label: "Orders (CSV)" },
  { value: "lines_csv", label: "Line Items (CSV)" },
];

export default function TaxPanel() {
  const fyOptions = useMemo(() => computeFYs(7), []);
  const [fy, setFy] = useState(fyOptions[0]);
  const [exportType, setExportType] = useState(EXPORT_TYPES[0].value);

  const handleDownload = () => {
    const params = new URLSearchParams({
      type: exportType,
      startYear: fy.startYear,
      endYear: fy.endYear,
      tz: "Australia/Melbourne",
    });
    window.open(`/exports/finance?${params.toString()}`, "_blank");
  };

  return (
    <div style={{ display: "grid", gap: "16px", maxWidth: 500 }}>
      <label>
        Financial Year:
        <select
          value={fy.label}
          onChange={(e) =>
            setFy(fyOptions.find((f) => f.label === e.target.value))
          }
        >
          {fyOptions.map((f) => (
            <option key={f.label} value={f.label}>
              {f.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Export Type:
        <select
          value={exportType}
          onChange={(e) => setExportType(e.target.value)}
        >
          {EXPORT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>

      <button onClick={handleDownload}>Download</button>
    </div>
  );
}