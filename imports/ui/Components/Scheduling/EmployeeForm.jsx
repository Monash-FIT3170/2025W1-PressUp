import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import './EmployeeForm.css';

export const EmployeeForm = ({ employee, onClose }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    dob: '',
    address: '',
    start_date: '',
    employment_type: 'Full-time',
    roles: [],
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        ...employee,
        dob: employee.dob ? new Date(employee.dob).toISOString().split('T')[0] : '',
        start_date: employee.start_date ? new Date(employee.start_date).toISOString().split('T')[0] : '',
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => {
        const newRoles = checked
            ? [...prev.roles, value]
            : prev.roles.filter(role => role !== value);
        return { ...prev, roles: newRoles };
    });
};


  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      dob: new Date(formData.dob),
      start_date: new Date(formData.start_date),
    };

    if (employee) {
      Meteor.call('employees.update', employee._id, dataToSubmit, (err) => {
        if (err) alert(err.reason);
        else onClose();
      });
    } else {
      Meteor.call('employees.insert', dataToSubmit, (err) => {
        if (err) alert(err.reason);
        else onClose();
      });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <form onSubmit={handleSubmit} className="employee-form">
          <h2>{employee ? 'Edit Employee' : 'Add Employee'}</h2>
          <input
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            placeholder="First Name"
            required
          />
          <input
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            placeholder="Last Name"
            required
          />
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone"
            required
          />
          <input
            name="dob"
            type="date"
            value={formData.dob}
            onChange={handleChange}
            required
          />
          <input
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Address"
            required
          />
          <input
            name="start_date"
            type="date"
            value={formData.start_date}
            onChange={handleChange}
            required
          />
          <select
            name="employment_type"
            value={formData.employment_type}
            onChange={handleChange}
          >
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Casual</option>
          </select>
          <div className="roles-checkboxes">
            {['Manager', 'Cashier', 'Cook', 'Waiter'].map(role => (
                <label key={role}>
                    <input
                        type="checkbox"
                        value={role}
                        checked={formData.roles.includes(role)}
                        onChange={handleRoleChange}
                    />
                    {role}
                </label>
            ))}
        </div>
          <div className="form-actions">
            <button type="submit">Save</button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};