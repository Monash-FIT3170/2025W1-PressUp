import React, { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { EmployeesCollection } from '../../../api/payroll/employee/employees-collection.js';
import { RosterItemsCollection } from '../../../api/payroll/roster/rosteritem-collection.js';
import { RosterItemForm } from './RosterItemForm.jsx';
import './RosterManager.css';
import { PayDetails } from './Pay Slip Items/PayDetails.jsx';

export const RosterManager = () => {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // State variables
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [editingRosterItem, setEditingRosterItem] = useState(null);
  const [showPayDetails, setShowPayDetails] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null); // <-- New state

  // Calculate week start and end dates
  const getWeekDates = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return { startOfWeek, endOfWeek };
  };

  const { startOfWeek, endOfWeek } = getWeekDates(currentWeek);

  // Fetch employees
  const { employees, isLoading: employeesLoading, error: employeesError } = useTracker(() => {
    const subscription = Meteor.subscribe('Employees');
    if (!subscription.ready()) return { employees: [], isLoading: true, error: null };
    try {
      const employeesData = EmployeesCollection.find().fetch();
      return { employees: employeesData, isLoading: false, error: null };
    } catch (err) {
      return { employees: [], isLoading: false, error: err.message };
    }
  });

  // Fetch roster items
  const { rosterItems, isLoading: rosterLoading, error: rosterError } = useTracker(() => {
    const subscription = Meteor.subscribe('rosteritems.byDateRange', startOfWeek, endOfWeek);
    if (!subscription.ready()) return { rosterItems: [], isLoading: true, error: null };
    try {
      const rosterData = RosterItemsCollection.find(
        { date: { $gte: startOfWeek, $lte: endOfWeek } },
        { sort: { date: 1, start_time: 1 } }
      ).fetch();
      return { rosterItems: rosterData, isLoading: false, error: null };
    } catch (err) {
      return { rosterItems: [], isLoading: false, error: err.message };
    }
  });

  const getRosterItemsForEmployeeAndDay = (employeeId, dayIndex) => {
    const targetDate = new Date(startOfWeek);
    targetDate.setDate(startOfWeek.getDate() + dayIndex);
    targetDate.setHours(0, 0, 0, 0);
    return rosterItems.filter(item => item.employee_id === employeeId && item.date.toDateString() === targetDate.toDateString());
  };

  const formatTime = (date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const calculateShiftDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return '';
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffHours = Math.round(((end - start) / (1000 * 60 * 60)) * 10) / 10;
    return `${diffHours}h`;
  };
  const formatBreakDuration = (breakMinutes) => {
    if (!breakMinutes || breakMinutes === 0) return '';
    if (breakMinutes < 60) return `${breakMinutes}m`;
    const hours = Math.floor(breakMinutes / 60);
    const minutes = breakMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  };

  const handleCellClick = (employeeId, dayIndex) => {
    const dayRosterItems = getRosterItemsForEmployeeAndDay(employeeId, dayIndex);
    if (dayRosterItems.length > 0) {
      setEditingRosterItem(dayRosterItems[0]);
      setShowShiftForm(true);
    } else {
      const targetDate = new Date(startOfWeek);
      targetDate.setDate(startOfWeek.getDate() + dayIndex);
      setEditingRosterItem({
        employee_id: employeeId,
        date: `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2,'0')}-${String(targetDate.getDate()).padStart(2,'0')}`,
        startTime: '09:00',
        endTime: '17:00',
        shift_type: 'Normal',
        department: '',
        role: '',
        status: 'confirmed',
        break_duration: 0,
        notes: ''
      });
      setShowShiftForm(true);
    }
  };

  const handleAddShift = () => { setEditingRosterItem(null); setShowShiftForm(true); };
  const handleCloseShiftForm = () => { setShowShiftForm(false); setEditingRosterItem(null); };
  const handlePreviousWeek = () => { const newWeek = new Date(currentWeek); newWeek.setDate(currentWeek.getDate() - 7); setCurrentWeek(newWeek); };
  const handleNextWeek = () => { const newWeek = new Date(currentWeek); newWeek.setDate(currentWeek.getDate() + 7); setCurrentWeek(newWeek); };
  const handleCurrentWeek = () => setCurrentWeek(new Date());

  // ------------------------------
  // Handle clicking the pay details button
  const handlePayDetails = (employee) => {
    setSelectedEmployee(employee); // <-- save employee object
    setShowPayDetails(true);       // <-- show modal
  };

  const renderTable = () => {
    if (employeesLoading || rosterLoading) return <div className="roster-loading">Loading roster data...</div>;
    if (employeesError || rosterError) return <div className="roster-error">Error: {employeesError || rosterError}</div>;
    if (employees.length === 0) return <div className="roster-loading">No employees found.</div>;

    return (
      <div className="roster-table-container">
        <table className="roster-table">
          <thead>
            <tr>
              <th className="roster-header-cell employee-header">Employee</th>
              {daysOfWeek.map((day, index) => {
                const dayDate = new Date(startOfWeek);
                dayDate.setDate(startOfWeek.getDate() + index);
                return (
                  <th key={day} className="roster-header-cell day-header">
                    <div>{day}</div>
                    <div className="date-display">{dayDate.getDate()}/{dayDate.getMonth() + 1}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {employees.map(employee => (
              <tr key={employee._id} className="roster-row">
                <td className="roster-cell employee-name-cell">
                  {employee.first_name} {employee.last_name}
                  <div>
                    <btn 
                      className="pay-details-btn"
                      onClick={() => handlePayDetails(employee)} // <-- pass full employee object
                    >
                      Pay Details
                    </btn>
                  </div>
                </td>
                {daysOfWeek.map((day, dayIndex) => {
                  const dayRosterItems = getRosterItemsForEmployeeAndDay(employee._id, dayIndex);
                  return (
                    <td key={day} className="roster-cell day-cell" onClick={() => handleCellClick(employee._id, dayIndex)}>
                      {dayRosterItems.length > 0 ? (
                        <div className="roster-item-display">
                          {dayRosterItems.map((item, itemIndex) => (
                            <div key={item._id || itemIndex} className={`roster-item ${item.shift_type?.toLowerCase().replace(' ', '-')}`}>
                              <div className="shift-time">{formatTime(item.start_time)} - {formatTime(item.end_time)}</div>
                              <div className="shift-duration">
                                {calculateShiftDuration(item.start_time, item.end_time)}
                                {item.break_duration > 0 && (
                                  <span className="break-duration"> {' • '}{formatBreakDuration(item.break_duration)} break</span>
                                )}
                              </div>
                              <div className="shift-details">
                                <span className="shift-type">{item.shift_type}</span>
                                {item.department && <span className="department">{item.department}</span>}
                                {item.role && <span className="role">{item.role}</span>}
                              </div>
                              {item.status && <div className={`shift-status status-${item.status}`}>{item.status}</div>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="empty-cell"><span className="add-shift-hint">Click to add shift</span></div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="roster-manager">
      <div className="roster-manager-header">
        <h1>Roster Manager</h1>
        <div className="week-navigation">
          <button className="week-nav-btn" onClick={handlePreviousWeek}>← Previous</button>
          <button className="current-week-btn" onClick={handleCurrentWeek}>Current Week</button>
          <button className="week-nav-btn" onClick={handleNextWeek}>Next →</button>
        </div>
        <button className="add-shift-btn" onClick={handleAddShift}>Add Shift</button>
      </div>

      <div className="roster-manager-content">{renderTable()}</div>

      {/* Shift Form Modal */}
      <RosterItemForm
        isOpen={showShiftForm}
        onClose={handleCloseShiftForm}
        initialData={editingRosterItem}
      />

      {/* Pay Details Modal */}
      {showPayDetails && selectedEmployee && (
        <PayDetails
          isOpen={showPayDetails}
          onClose={() => setShowPayDetails(false)}
          employee={selectedEmployee} // passing employee details
        />
      )}
    </div>
  );
};
