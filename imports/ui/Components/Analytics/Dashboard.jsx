import React, { useState } from "react";
import { OrdersCollection } from "/imports/api/orders/orders-collection";
import { useTracker } from "meteor/react-meteor-data";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar
} from "recharts";


export default function Dashboard() {
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [chartData, setChartData] = useState([]);
  const [startDate, setStartDate] = useState(() => formatDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)));
  const [endDate, setEndDate] = useState(() => formatDate(new Date()));
  const [startTime, setStartTime] = useState("06:00");
  const [endTime, setEndTime] = useState("12:00");
  const [bars, setBars] = useState("value");
  const [filter, setFilter] = useState("Staff");

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
      name: order._id.substring(0, 3),

      // Total Sales per order:
      value: Number(order.items.reduce((acc, item) => acc + (item.price || 0), 0)).toFixed(3),
      // Cost per order:
      cost: Number(order.items.reduce((acc, item) => acc + (item.cost || 0), 0)).toFixed(3),
      // Profit per order:
      profit: Number(order.items.reduce((acc, item) => {
        const price = item.price || 0;
        const cost = item.cost || 0;

        if (cost === 0) {
          return acc + price; // skip division if cost is zero
        }

        return acc + (price - cost);
      }, 0)).toFixed(3),
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
        <div>
          <label>Data Type:</label>
          <select name="Bar type" onChange={(e) => setBars(e.target.value)}>
            <option value="value">Sales</option>
            <option value="cost">Cost</option>
            <option value="profit">Profit</option>
          </select>
          <label>Filter Type:</label>
          <select name="Filter type" onChange={(e) => setFilter(e.target.value)}>
            <option value="Staff">Staff</option>
            <option value="Table No.">Table Number</option>
          </select>
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
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar type="monotone" dataKey={bars} fill="#8884d8" isAnimationActive={false} />
      </BarChart>
    </div>
  );
}
