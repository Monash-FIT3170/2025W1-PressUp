// ui/Components/Analytics/IngredientUsageChart.jsx
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList } from 'recharts';

export default function IngredientUsageChart({ onlyClosed = false, start = null, end = null }) {
  const [data, setData] = useState([]);
  const [width, setWidth] = useState(0);
  const HEIGHT = 360;
  const hostRef = useRef(null);

  // Stable sizing
  useLayoutEffect(() => {
    if (!hostRef.current) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect?.width ?? 0;
      setWidth(prev => (Math.abs(prev - w) > 0.5 ? w : prev));
    });
    ro.observe(hostRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    Meteor.call('analytics.ingredientUsage', { onlyClosed, start, end }, (err, res) => {
      if (err) { console.error(err); setData([]); return; }
      const shaped = (res || []).map(d => ({
        name: d.ingredientName ?? d.ingredientId,
        used: Number(d.used) || 0,
        units: d.units || ''
      }));
      setData(shaped);
    });
  }, [onlyClosed, start, end]);

  const formatTooltip = (value, _name, { payload }) => {
    const units = payload?.units ? ` ${payload.units}` : '';
    return [`${value}${units}`, 'Used'];
  };

  return (
    <div ref={hostRef} style={{ width: '100%', height: HEIGHT, overflow: 'hidden' }}>
      {width > 0 && (
        <BarChart
          width={Math.floor(width)}
          height={HEIGHT}
          data={data}
          margin={{ top: 20, right: 20, left: 10, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} height={80} tickMargin={16} />
          <YAxis allowDecimals domain={[0, 'dataMax + 1']} />
          <Tooltip formatter={formatTooltip} />
          <Bar dataKey="used" fill="#0ea5e9" stroke="#0ea5e9" isAnimationActive={false}>
            <LabelList dataKey="used" position="top" />
          </Bar>
        </BarChart>
      )}
    </div>
  );
}
