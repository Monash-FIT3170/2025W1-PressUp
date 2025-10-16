import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { EmployeesCollection } from '/imports/api/payroll/employee/employees-collection.js';
import { RosterItemsCollection } from '/imports/api/payroll/roster/rosteritem-collection.js';
import { RolesCollection } from '/imports/api/payroll/roles/roles-collection.js';
import { DepartmentsCollection } from '/imports/api/payroll/departments/departments-collection.js';
import { PrintPaySlip } from './PrintPaySlip.jsx';
import './StaffDashboard.css';

const StaffDashboard = ({ sidebarOpen }) => {
  const [email, setEmail] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedRoleData, setSelectedRoleData] = useState(null);
  const [selectedDepartmentName, setSelectedDepartmentName] = useState('N/A');
  const [payStartDate, setPayStartDate] = useState(null);
  const [payEndDate, setPayEndDate] = useState(null);
  const [totalHours, setTotalHours] = useState(0);

  const { staff, isLoading } = useTracker(() => {
    if (!searchEmail) return { staff: [], isLoading: false };

    const subEmp = Meteor.subscribe('Employees');
    const subRoster = Meteor.subscribe('rosteritems.all');
    const subRoles = Meteor.subscribe('roles.all');
    const subDepts = Meteor.subscribe('departments.all');

    if (!subEmp.ready() || !subRoster.ready() || !subRoles.ready() || !subDepts.ready())
      return { staff: [], isLoading: true };

    const employee = EmployeesCollection.findOne({ email: searchEmail });
    if (!employee) return { staff: [], isLoading: false };

    const rosterItems = RosterItemsCollection.find({ employee_id: employee._id }).fetch();

    return { staff: [{ employee, rosterItems }], isLoading: false };
  }, [searchEmail]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchEmail(email.trim());
    setSelectedEmployee(null);
  };

  const handlePayDetails = ({ employee, rosterItems }) => {
    const firstRoleName = employee.roles?.[0];
    const roleObj = firstRoleName ? RolesCollection.findOne({ name: firstRoleName }) : null;
    const roleName = roleObj?.name || 'N/A';

    let departmentName = 'N/A';
    if (roleObj?.department_id) {
      const dept = DepartmentsCollection.findOne({ _id: roleObj.department_id });
      if (dept?.name) departmentName = dept.name;
    }

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
    setSelectedRoleData(roleObj);
    setSelectedDepartmentName(departmentName);
    setPayStartDate(startDate);
    setPayEndDate(endDate);
    setTotalHours(totalHours);
  };

  return (
    <div className={`dashboard-page ${sidebarOpen ? 'with-sidebar' : ''}`}>
      <form onSubmit={handleSubmit} className="staff-search-form">
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

      {staff.map(({ employee, rosterItems }) => {
        const totalHoursCard = rosterItems.reduce((sum, item) => {
          const start = new Date(item.start_time);
          const end = new Date(item.end_time);
          let hours = (end - start) / (1000 * 60 * 60);
          hours -= (item.break_duration || 0) / 60;
          return sum + Math.max(0, hours);
        }, 0).toFixed(1);

        return (
          <div key={employee._id} className="staff-info-card">
            <p><strong>Name:</strong> {employee.first_name} {employee.last_name}</p>
            <p><strong>Role:</strong> {employee.roles?.[0] || 'N/A'}</p>
            <p><strong>Total Hours:</strong> {totalHoursCard}h</p>
            <button
              className="pay-details-btn"
              onClick={() => handlePayDetails({ employee, rosterItems })}
            >
              Generate Pay Slip
            </button>
          </div>
        );
      })}

      {selectedEmployee && (
        <PrintPaySlip
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
