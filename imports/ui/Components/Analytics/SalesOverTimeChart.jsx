import React, { useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function moneyTick(v) {
  return `$${Number(v).toLocaleString()}`;
}

export default function SalesOverTimeChart({ onlyClosed = false, start = null, end = null }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    Meteor.call('analytics.salesOverTime', { onlyClosed, start, end }, (err, res) => {
      setData(err ? [] : (res || []));
    });
  }, [onlyClosed, start?.valueOf?.(), end?.valueOf?.()]);

  return (
    <div style={{ width:'100%', height: 280 }}>
      <ResponsiveContainer width="100%" height="100%" debounce={200}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickMargin={8} />
          <YAxis tickFormatter={moneyTick} width={80} />
          <Tooltip formatter={(v) => moneyTick(v)} labelFormatter={(d) => `Date: ${d}`} />
          <Line type="monotone" dataKey="grossSales" dot={false} stroke="#16a34a" strokeWidth={3} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
