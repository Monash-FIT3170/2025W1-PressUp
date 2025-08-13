// ui/Components/Analytics/CategoryChart.jsx
import React, { useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList
} from 'recharts';

export default function CategoryCountChart({ onlyClosed = false }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    Meteor.call('analytics.categoryCounts', { onlyClosed }, (err, res) => {
      if (err) {
        console.error(err);
        setData([]);
        return;
      }
      // ui/Components/Analytics/CategoryChart.jsx
      const shaped = (res || []).map(d => ({
        name: d.categoryName ?? d.categoryId,
        count: Number(d.count) || 0,       // <- force number
      }));

      setData(shaped);
    });
  }, [onlyClosed]);

  // ui/Components/Analytics/CategoryChart.jsx
  return (
    <div style={{ width: '100%', height: 360, overflow: 'visible' }}>
      <ResponsiveContainer width="100%" height="100%" debounce={200}>
        <BarChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-30}
            textAnchor="end"
            interval={0}
            height={60}
            tickMargin={10}
            allowDuplicatedCategory={false}
          />
          <YAxis allowDecimals={false} domain={[0, 'dataMax + 1']} />
          <Tooltip />
          <Bar dataKey="count" fill="#4f46e5" stroke="#4f46e5" isAnimationActive={false}>
            <LabelList dataKey="count" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

}
