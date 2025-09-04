import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList } from 'recharts';

export default function ItemsFrequencyChart({
  onlyClosed = false,
  start = null,
  end = null,
  metric = 'occurrences' // or 'quantity' if you ever want totals instead
}) {
  const [data, setData] = useState([]);
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

  useEffect(() => {
    Meteor.call('analytics.itemFrequency', { onlyClosed, start, end }, (err, res) => {
      if (err) { console.error(err); setData([]); return; }
      const shaped = (res || []).map(d => ({
        name: d.itemName,
        count: Number(d[metric]) || 0
      }));
      setData(shaped);
    });
  }, [onlyClosed, start, end, metric]);

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
          <YAxis allowDecimals={false} domain={[0, 'dataMax + 1']} />
          <Tooltip labelFormatter={(v) => `Item: ${v}`} formatter={(v) => [v, metric === 'quantity' ? 'Total Qty' : '# Occurrences']} />
          <Bar dataKey="count" fill="#4f46e5" stroke="#4f46e5" isAnimationActive={false}>
            <LabelList dataKey="count" position="top" />
          </Bar>
        </BarChart>
      )}
    </div>
  );
}
