import React from 'react';
import './Sidebar.css';

export const Sidebar = () => (
  <div class='sidebar'>
    <ul style={{ listStyle: 'none', padding: 0 }}>
      <li><h2>Home</h2></li>
      <li><h2>Inventory</h2></li>
      <li><h2>Menu</h2></li>
      <li><h2>Scheduling</h2></li>
    </ul>
  </div>
);

