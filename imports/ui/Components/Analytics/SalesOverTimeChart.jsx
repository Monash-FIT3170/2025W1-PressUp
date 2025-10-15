import React, { useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function moneyTick(v) {
  return `$${Number(v).toLocaleString()}`;
}

export default function SalesOverTimeChart({ onlyClosed = false, start = null, end = null, metric = "sales", staff = "all" }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    Meteor.call('analytics.salesOverTime', { onlyClosed, start, end, metric, staff }, (err, res) => {
      setData(err ? [] : (res || []));
    });
  }, [onlyClosed, start?.valueOf?.(), end?.valueOf?.(), metric, staff]);

  return (
    <div style={{ width:'100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%" debounce={200}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickMargin={8} label={{ value: "Date", position: "insideBottom", offset: -10 }}/>
          <YAxis tickFormatter={moneyTick} width={80} label={{ value: "Amount ($)", angle: -90, position: "insideLeft" }}/>
          <Tooltip formatter={(v) => moneyTick(v)} labelFormatter={(d) => `Date: ${d}`} />
          <Line 
            type="monotone" 
            dataKey={metric} 
            dot={false} 
            stroke={metric === "sales" ? "#16a34a" : metric === "cost" ? "#dc2626" : "#2563eb"} 
            strokeWidth={3} 
            isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
