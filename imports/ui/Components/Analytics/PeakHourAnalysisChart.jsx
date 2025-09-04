import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import dayjs from 'dayjs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList } from 'recharts';

// Helper to convert 0–23 into "12 AM" etc.
function hourLabel(h) {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12} ${ampm}`;
}

export default function PeakHourChart({
  onlyClosed = false,
  start = null,
  end = null
}) {
  const [data, setData] = useState([]);
  const [width, setWidth] = useState(0);
  const HEIGHT = 360;
  const hostRef = useRef(null);

  // ResizeObserver for stable width (like your ItemsFrequencyChart)
  useLayoutEffect(() => {
    if (!hostRef.current) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect?.width ?? 0;
      setWidth(prev => (Math.abs(prev - w) > 0.5 ? w : prev));
    });
    ro.observe(hostRef.current);
    return () => ro.disconnect();
  }, []);

  // Fetch peak hour data
  useEffect(() => {
    Meteor.call('analytics.peakHours', { onlyClosed, start, end }, (err, res) => {
      // In useEffect after Meteor.call
        if (!start && !end) {
        // Hourly
        const map = new Map(res.map(d => [d.hour, d.count]));
        const shaped = Array.from({ length: 24 }, (_, h) => ({
            hour: hourLabel(h),
            count: map.get(h) || 0
        }));
        setData(shaped);
        } else {
        // Daily
        const dailyCounts = new Map(res.map(d => [d.date, d.count]));
        const shaped = [];

        const startDate = dayjs(start);
        const endDate = dayjs(end);

        for (let d = startDate; !d.isAfter(endDate); d = d.add(1, "day")) {
            const key = d.format("YYYY-MM-DD");
            shaped.push({
            date: d.format("DD/MM"),
            count: dailyCounts.get(key) || 0
            });
        }
        setData(shaped);
        }
    });
  }, [onlyClosed, start, end]);

  return (
    <div ref={hostRef} style={{ width: '100%', height: HEIGHT, overflow: 'hidden' }}>
      {width > 0 && (
        <BarChart
          width={Math.floor(width)}
          height={HEIGHT}
          data={data}
          margin={{ top: 20, right: 20, left: 10, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={(!start && !end) ? "hour" : "date"}
            interval={0}
            angle={-30}
            textAnchor="end"
            height={60}
          />
          <YAxis allowDecimals={false} />
          <Tooltip
            labelFormatter={(v) => (!start && !end) ? `Hour: ${v}` : `Date: ${v}`}
            formatter={(v) => [v, '# Orders']}
          />
          <Bar dataKey="count" fill="#16a34a" stroke="#166534" isAnimationActive={false}>
            <LabelList dataKey="count" position="top" />
          </Bar>
        </BarChart>
      )}
    </div>
  );
}
