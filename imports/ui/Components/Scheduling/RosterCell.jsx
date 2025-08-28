import React, { useState } from 'react';
import './RosterCell.css';

export const RosterCell = ({ 
  startTime, 
  endTime, 
  duration, 
  cost, 
  department, 
  role, 
  employeeName, 
  employeeId,
  onOptionsClick,
  className
}) => {
  const [showOptions, setShowOptions] = useState(false);

  const handleOptionsClick = (e) => {
    e.stopPropagation();
    if (onOptionsClick) {
      onOptionsClick();
    } else {
      setShowOptions(!showOptions);
    }
  };

  return (
    <div className={`roster-cell ${className}`}>
      {/* Left accent bar */}
      <div className="roster-cell-accent"></div>
      
      {/* Main content */}
      <div className="roster-cell-content">
        {/* Header row with time and options */}
        <div className="roster-cell-header">
          <span className="roster-cell-time">
            {startTime} - {endTime}
          </span>
          <button 
            className="roster-cell-options-btn"
            onClick={handleOptionsClick}
            aria-label="More options"
          >
            <svg width="4" height="16" viewBox="0 0 4 16" fill="none">
              <circle cx="2" cy="2" r="2" fill="currentColor"/>
              <circle cx="2" cy="8" r="2" fill="currentColor"/>
              <circle cx="2" cy="14" r="2" fill="currentColor"/>
            </svg>
          </button>
        </div>

        {/* Duration and pay */}
        <div className="roster-cell-duration-pay">
          {duration} | {pay}
        </div>

        {/* Department full name */}
        <div className="roster-cell-dept-name">
          {department}
        </div>

        {/* Role */}
        <div className="roster-cell-role">
          {role}
        </div>

        {/* Employee name */}
        <div className="roster-cell-employee-name">
          {employeeName}
        </div>

        {/* Employee ID */}
        <div className="roster-cell-employee-id">
          {employeeId}
        </div>
      </div>

      {/* Options dropdown (if no external handler) */}
      {showOptions && !onOptionsClick && (
        <div className="roster-cell-options-dropdown">
          <button className="roster-cell-option">Edit</button>
          <button className="roster-cell-option">Delete</button>
          <button className="roster-cell-option">Copy</button>
        </div>
      )}
    </div>
  );
};
