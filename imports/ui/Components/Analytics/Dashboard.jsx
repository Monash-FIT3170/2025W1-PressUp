import React, { useState, useCallback } from "react"; // Added useCallback


import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

export default function Dashboard() {

console.log({ LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend });

  const data = [
    { name: "Jan", value: 40 },
    { name: "Feb", value: 30 },
    { name: "Mar", value: 20 },
    { name: "Apr", value: 27 },
    { name: "May", value: 18 },
    { name: "Jun", value: 23 },
    { name: "Jul", value: 34 }
  ];

  return (
    <div style={{ textAlign: "center" }}>
      <h1>My Recharts Graph</h1>
      <LineChart
        width={500}
        height={300}
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="value" stroke="#8884d8" />
      </LineChart>
    </div>
  );
}
