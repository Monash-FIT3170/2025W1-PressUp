import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { EmployeesCollection } from '/imports/api/payroll/employee/employees-collection.js';
import { RosterItemsCollection } from '/imports/api/payroll/roster/rosteritem-collection.js';
import { PayDetails } from '../Scheduling/PaySlipItems/PayDetails.jsx';
import './StaffDashboard.css';

const StaffDashboard = ({ sidebarOpen }) => {
  const [email, setEmail] = useState('');
  const [searchEmail, setSearchEmail] = useState('');

  const [showPayDetails, setShowPayDetails] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedRoleData, setSelectedRoleData] = useState(null);
  const [selectedDepartmentName, setSelectedDepartmentName] = useState('N/A');
  const [payStartDate, setPayStartDate] = useState(null);
  const [payEndDate, setPayEndDate] = useState(null);
  const [totalHours, setTotalHours] = useState(0);

  // Fetch staff by email
  const { staff, isLoading } = useTracker(() => {
    if (!searchEmail) return { staff: [], isLoading: false };

    const subEmp = Meteor.subscribe('Employees');
    const subRoster = Meteor.subscribe('rosteritems.all');
    if (!subEmp.ready() || !subRoster.ready()) return { staff: [], isLoading: true };

    const employee = EmployeesCollection.findOne({ email: searchEmail });
    if (!employee) return { staff: [], isLoading: false };

    const rosterItems = RosterItemsCollection.find({ employee_id: employee._id }).fetch();

    return { staff: [ { employee, rosterItems } ], isLoading: false };
  }, [searchEmail]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchEmail(email.trim());
  };

  const handlePayDetails = ({ employee, rosterItems }) => {
    const role = employee.roles?.[0] || 'N/A';
    const department = employee.department || 'N/A';

    const confirmedItems = rosterItems
      .filter(item => item.status === 'confirmed')
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const startDate = confirmedItems.length > 0 ? new Date(confirmedItems[0].date) : null;
    const endDate = confirmedItems.length > 0 ? new Date(confirmedItems[confirmedItems.length - 1].date) : null;

    const totalHours = confirmedItems.reduce((sum, item) => {
      const start = new Date(item.start_time);
      const end = new Date(item.end_time);
      let hours = (end - start) / (1000 * 60 * 60);
      hours -= (item.break_duration || 0) / 60;
      return sum + Math.max(0, hours);
    }, 0);

    setSelectedEmployee(employee);
    setSelectedRoleData({ name: role });
    setSelectedDepartmentName(department);
    setPayStartDate(startDate);
    setPayEndDate(endDate);
    setTotalHours(totalHours);
    setShowPayDetails(true);
  };

  return (
    <div className={`dashboard-page ${sidebarOpen ? 'with-sidebar' : ''}`}>
      <form onSubmit={handleSubmit}>
        <label>
          Enter staff email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="staff@example.com"
          />
        </label>
        <button type="submit">Search</button>
      </form>

      {isLoading && <p>Loading...</p>}
      {!isLoading && staff.length === 0 && searchEmail && (
        <p>No staff found for "{searchEmail}"</p>
      )}

      {staff.map((s) => (
        <div key={s.employee._id} className="staff-info-card">
          <p><strong>Name:</strong> {s.employee.first_name} {s.employee.last_name}</p>
          <p><strong>Role:</strong> {s.employee.roles?.[0] || 'N/A'}</p>
          <p><strong>Department:</strong> {s.employee.department || 'N/A'}</p>
          <p><strong>Total Hours:</strong> {s.rosterItems.reduce((sum, item) => {
            const start = new Date(item.start_time);
            const end = new Date(item.end_time);
            let hours = (end - start) / (1000 * 60 * 60);
            hours -= (item.break_duration || 0) / 60;
            return sum + Math.max(0, hours);
          }, 0).toFixed(1)}h</p>
          <button className="pay-details-btn" onClick={() => handlePayDetails(s)}>
            View Pay Details
          </button>
        </div>
      ))}

      {showPayDetails && selectedEmployee && (
        <PayDetails
          isOpen={showPayDetails}
          onClose={() => setShowPayDetails(false)}
          employee={selectedEmployee}
          roleData={selectedRoleData}
          departmentName={selectedDepartmentName}
          startDate={payStartDate}
          endDate={payEndDate}
          totalHours={totalHours}
        />
      )}
    </div>
  );
};

export default StaffDashboard;
