import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { EmployeesCollection } from '../../../api/payroll/employee/employees-collection.js';
import { EmployeeForm } from './EmployeeForm.js';
import './EmployeeTable.css';

export const EmployeeTable = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const employees = useTracker(() => {
    Meteor.subscribe('Employees');
    return EmployeesCollection.find().fetch();
  });

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setEditingEmployee(null);
    setShowForm(false);
  };

  return (
    <div className="employee-table-container">
      <button
        className="add-employee-btn"
        onClick={() => {
          setEditingEmployee(null);
          setShowForm(true);
        }}
      >
        Add New Employee
      </button>
      {showForm && (
        <EmployeeForm
          employee={editingEmployee}
          onClose={handleCloseForm}
        />
      )}
      <table className="employee-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee._id}>
              <td>
                {employee.first_name} {employee.last_name}
              </td>
              <td>{employee.email}</td>
              <td>{employee.phone}</td>
              <td>
                <button onClick={() => handleEdit(employee)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};