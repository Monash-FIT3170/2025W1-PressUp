import React, { useState } from "react";
import { OrdersCollection } from "/imports/api/orders/orders-collection";
import { useTracker } from "meteor/react-meteor-data";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar
} from "recharts";


export default function Dashboard() {
  const formatDate = (date) => date.toISOString().split("T")[0];

  const today = formatDate(new Date());
  const lastWeek = formatDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

  const [chartData, setChartData] = useState([]);
  const [startDate, setStartDate] = useState(lastWeek)
  const [endDate, setEndDate] = useState(today);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("12:00");

  const Orders = useTracker(() => {
    const handle = Meteor.subscribe('orders.all');
    if (!handle.ready()) {
      return []; // wait until subscription is ready
    }
    return OrdersCollection.find().fetch();
  }, []);

  const updateChart = (e) => {
    if (e) e.preventDefault(); // stop form reload

    if (!startDate || !endDate || !startTime || !endTime) {
      alert("Please select both start and end dates and times.");
      return;
    }
    // Normalize start and end dates to cover full days in local time
    const startDateObj = new Date(startDate);
    startDateObj.setHours(0, 0, 0, 0);
    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999);

    // Parse startTime and endTime strings into minutes since midnight
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    //console.log('J', Orders[70]);
    const filtered = Orders.filter(order => {
      const itemDate = order.createdAt; // Date object

      // Filter by date (local date)
      if (itemDate < startDateObj || itemDate > endDateObj) return false;

      // Extract local time minutes from midnight
      const itemMinutes = itemDate.getHours() * 60 + itemDate.getMinutes();

      // Filter by time of day (on each day)
      if (itemMinutes < startMinutes || itemMinutes > endMinutes) return false;

      return true;
    });

    const chartData = filtered.map((order) => ({
      name: order._id.substring(0,3),

      // Total Sales per order:
      value: order.items.reduce((acc, item) => acc + (item.price || 0), 0),
      // Cost per order:
      cost: order.items.reduce((acc, item) => acc + (Math.round(item.cost, 4) || 0), 0),
        
    }));

    setChartData(chartData);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <form onSubmit={updateChart} style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <label>Start Date:</label>
          <input type='date' id='startDate' value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label>End Date:</label>
          <input type='date' id='endDate' value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div>
          <label>Start Time:</label>
          <input type='time' id='startTime' value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </div>
        <div>
          <label>End Time:</label>
          <input type='time' id='endTime' value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>
        <button type="submit">Update Charts</button>
      </form>
      <h1>Orders</h1>
      <BarChart
        width={1000}
        height={300}
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name"/>
        <YAxis/>
        <Tooltip />
        <Legend />
        <Bar type="monotone" dataKey="value" fill="#8884d8" isAnimationActive={false} />
        <Bar type="monotone" dataKey="cost" fill="#d76b1eff" isAnimationActive={false} />
      </BarChart>
    </div>
  );
}
