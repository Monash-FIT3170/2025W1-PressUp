import React, { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { EmployeesCollection } from '../../../api/payroll/employee/employees-collection.js';
import { RosterItemForm } from './RosterItemForm.jsx';
import './RosterManager.css';

export const RosterManager = () => {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Fetch employees from the collection
  const { employees, isLoading, error } = useTracker(() => {
    const subscription = Meteor.subscribe('Employees');
    
    if (!subscription.ready()) {
      return { employees: [], isLoading: true, error: null };
    }

    try {
      const employeesData = EmployeesCollection.find().fetch();
      return { 
        employees: employeesData, 
        isLoading: false, 
        error: null 
      };
    } catch (err) {
      return { employees: [], isLoading: false, error: err.message };
    }
  });

  // State variables
  const [rosterData, setRosterData] = useState({});
  const [showShiftForm, setShowShiftForm] = useState(false);

  // Effects
  useEffect(() => {
    // Load roster data from backend when employees are available
    if (employees.length > 0) {
      loadRosterData();
    }
  }, [employees]);

  // Event handlers
  const loadRosterData = async () => {
    try {
      // TODO: Replace with actual roster API call
      // const data = await Meteor.call('roster.getData');
      // setRosterData(data);
      
      // For now, initialize with empty data for each employee
      if (employees.length > 0) {
        const initialData = {};
        employees.forEach(emp => {
          initialData[emp._id] = {};
          daysOfWeek.forEach(day => {
            initialData[emp._id][day] = null;
          });
        });
        setRosterData(initialData);
      }
    } catch (err) {
      console.error('Error loading roster data:', err);
    }
  };

  const handleCellClick = (employeeId, day) => {
    // TODO: Handle cell click - open shift editor, etc.
    console.log(`Clicked on ${day} for employee ${employeeId}`);
  };

  const handleAddShift = () => {
    setShowShiftForm(true);
  };

  const handleCloseShiftForm = () => {
    setShowShiftForm(false);
  };

  const handleSubmitShift = (shiftData) => {
    // TODO: Save shift data to backend
    console.log('New shift data:', shiftData);
    
    // For now, just update local state
    const { employeeId, date, startTime, endTime, department, role, notes } = shiftData;
    
    // Convert date to day of week
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    
    setRosterData(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [dayOfWeek]: {
          startTime,
          endTime,
          department,
          role,
          notes,
          date
        }
      }
    }));
  };

  // Render methods
  const renderTable = () => {
    if (isLoading) {
      return <div className="roster-loading">Loading employees...</div>;
    }

    if (error) {
      return <div className="roster-error">Error: {error}</div>;
    }

    if (employees.length === 0) {
      return <div className="roster-loading">No employees found.</div>;
    }

    return (
      <div className="roster-table-container">
        <table className="roster-table">
          <thead>
            <tr>
              <th className="roster-header-cell employee-header">Employee</th>
              {daysOfWeek.map(day => (
                <th key={day} className="roster-header-cell day-header">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map(employee => (
              <tr key={employee._id} className="roster-row">
                <td className="roster-cell employee-name-cell">
                  {employee.first_name} {employee.last_name}
                </td>
                {daysOfWeek.map(day => (
                  <td 
                    key={day} 
                    className="roster-cell day-cell"
                    onClick={() => handleCellClick(employee._id, day)}
                  >
                    {/* TODO: Display shift information here */}
                    {rosterData[employee._id]?.[day] || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Main render
  return (
    <div className="roster-manager">
      <div className="roster-manager-header">
        <h1>Roster Manager</h1>
        <button 
          className="add-shift-btn"
          onClick={handleAddShift}
        >
          Add Shift
        </button>
      </div>
      
      <div className="roster-manager-content">
        {renderTable()}
      </div>

      {/* Shift Form Modal */}
      <RosterItemForm
        isOpen={showShiftForm}
        onClose={handleCloseShiftForm}
        onSubmit={handleSubmitShift}
      />
    </div>
  );
};
