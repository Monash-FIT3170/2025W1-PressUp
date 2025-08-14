// ui/Components/Analytics/IngredientUsageTimeseries.jsx
import React, { useEffect, useMemo, useLayoutEffect, useRef, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Brush
} from 'recharts';

// Pick enough distinct colors for multiple ingredients:
const PALETTE = [
  '#2563eb', '#16a34a', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#e11d48', '#84cc16',
  '#9333ea', '#0ea5e9', '#f97316', '#059669',
  '#3b82f6', '#a855f7', '#10b981', '#f43f5e'
];

export default function IngredientUsageTimeseries({
  start = null,
  end = null,
  onlyClosed = false,
  maxLines = 8 // show top-N ingredients (by total used) to keep it readable
}) {
  const [raw, setRaw] = useState([]);
  const [width, setWidth] = useState(0);
  const HEIGHT = 360;
  const hostRef = useRef(null);

  // Stable sizing (avoids ResponsiveContainer flicker)
  useLayoutEffect(() => {
    if (!hostRef.current) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect?.width ?? 0;
      setWidth(prev => (Math.abs(prev - w) > 0.5 ? w : prev));
    });
    ro.observe(hostRef.current);
    return () => ro.disconnect();
  }, []);

  // Fetch timeseries from server (uses orders.createdAt)
  useEffect(() => {
    Meteor.call('analytics.ingredientUsageTimeseries', { start, end, onlyClosed }, (err, res) => {
      if (err) { console.error(err); setRaw([]); return; }
      setRaw(Array.isArray(res) ? res : []);
    });
  }, [start, end, onlyClosed]);

  // Pivot to "wide" format: one row per day, one column per ingredient
  const { data, keys, unitsByKey } = useMemo(() => {
    const totals = new Map();     // ingredientName -> total used
    const unitsByKey = new Map(); // ingredientName -> units

    for (const r of raw) {
      const k = r.ingredientName || r.ingId;
      totals.set(k, (totals.get(k) || 0) + (Number(r.used) || 0));
      if (r.units) unitsByKey.set(k, r.units);
    }

    const keys = [...totals.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxLines)
      .map(([k]) => k);

    const byDate = new Map(); // dateStr -> row
    for (const r of raw) {
      const date = r.date; // "YYYY-MM-DD"
      const k = r.ingredientName || r.ingId;
      if (!keys.includes(k)) continue;

      const row = byDate.get(date) || { date };
      row[k] = (row[k] || 0) + (Number(r.used) || 0);
      byDate.set(date, row);
    }

    const rows = [...byDate.values()].sort((a, b) => (a.date < b.date ? -1 : 1));
    for (const row of rows) for (const k of keys) if (row[k] == null) row[k] = 0;

    return { data: rows, keys, unitsByKey };
  }, [raw, maxLines]);

  const tooltipFormatter = (value, name) => {
    const u = unitsByKey.get(name);
    return [`${value}${u ? ` ${u}` : ''}`, name];
  };

  return (
    <div ref={hostRef} style={{ width: '100%', height: HEIGHT, overflow: 'hidden' }}>
      {width > 0 && (
        
        <LineChart
          width={Math.floor(width)}
          height={HEIGHT}
          data={data}
          margin={{ top: 16, right: 20, left: 10, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickMargin={10} />
          <YAxis allowDecimals domain={[0, 'dataMax + 5']} />
          <Tooltip formatter={tooltipFormatter} />
          <Legend />
          <Brush dataKey="date" height={24} travellerWidth={8} />

          {keys.map((k, i) => (
            <Line
              key={k}
              type="monotone"
              dataKey={k}
              stroke={PALETTE[i % PALETTE.length]}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
        
      )}
    </div>
  );
}
