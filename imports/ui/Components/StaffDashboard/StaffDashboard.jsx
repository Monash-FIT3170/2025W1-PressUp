// imports/ui/Components/StaffDashboard/StaffDashboard.jsx
import React from 'react';
import './StaffDashboard.css';

const StaffDashboard = ({ sidebarOpen }) => {
  return (
    <div className={`dashboard-page ${sidebarOpen ? 'with-sidebar' : ''}`}>
      <div className="dashboard-content">
        <div className="dashboard-empty">
          <p>Welcome to the dashboard. Features and metrics will appear here.</p>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
