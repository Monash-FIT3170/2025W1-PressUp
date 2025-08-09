import React, { useState, useCallback, useMemo } from "react"; // Added useCallback
import { OrdersCollection } from "/imports/api/orders/orders-collection";
import { useTracker } from "meteor/react-meteor-data";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar
} from "recharts";


export default function Dashboard() {
  const Orders = useTracker(() => {
    const handle = Meteor.subscribe('orders.all');
    if (!handle.ready()) {
      return []; // wait until subscription is ready
    }
    return OrdersCollection.find().fetch();
  }, []);

  const table1 = useMemo(() => Orders.filter((order) => order.table === "1"), [Orders]);

  const table1data = useMemo(() => {
    return table1.map((order) => ({
      name: order._id.substring(0,3),
      value: order.items.reduce((acc, item) => acc + (item.price || 0), 0), // Sum of item prices
    }));
  }, [table1]);

  const [chartData, setChartData] = useState([]);

  const updateChart = () => {
    setChartData(table1data);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <button onClick={updateChart}>Update Charts</button>
      <h1>Table 1 Orders</h1>
      <BarChart
        width={1000}
        height={300}
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name"/>
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar type="monotone" dataKey="value" fill="#8884d8" isAnimationActive={false} />
      </BarChart>
    </div>
  );
}
