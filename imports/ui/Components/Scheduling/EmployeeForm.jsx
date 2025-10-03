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
    // new auth/admin fields
    username: '',
    password: '',
    isAdmin: false,
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        ...employee,
        dob: employee.dob ? new Date(employee.dob).toISOString().split('T')[0] : '',
        start_date: employee.start_date ? new Date(employee.start_date).toISOString().split('T')[0] : '',
        username: employee.username || '',
        password: '',
        isAdmin: !!employee.isAdmin,
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleRoleChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const roles = checked ? [...prev.roles, value] : prev.roles.filter(r => r !== value);
      return { ...prev, roles };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      dob: formData.dob ? new Date(formData.dob) : null,
      start_date: formData.start_date ? new Date(formData.start_date) : null,
    };

    if (employee) {
      Meteor.call('employees.update', employee._id, dataToSubmit, (err) => {
        if (err) alert(err.reason || err.message);
        else onClose?.();
      });
    } else {
      Meteor.call('employees.insert', dataToSubmit, (err) => {
        if (err) alert(err.reason || err.message);
        else onClose?.();
      });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <form onSubmit={handleSubmit} className="employee-form">
          <h2>{employee ? 'Edit Employee' : 'Add Employee'}</h2>

          <div className="form-field">
            <label htmlFor="first_name">First Name</label>
            <input
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="First Name"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="last_name">Last Name</label>
            <input
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Last Name"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="dob">Date of Birth</label>
            <input
              id="dob"
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="address">Address</label>
            <input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Address"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="start_date">Start Date</label>
            <input
              id="start_date"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="employment_type">Employment Type</label>
            <select
              id="employment_type"
              name="employment_type"
              value={formData.employment_type}
              onChange={handleChange}
              required
            >
              <option value="">Select type…</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Casual">Casual</option>
            </select>
          </div>

          {/* Roles (pick one style; removed duplicate block) */}
          <div className="form-field">
            <label>Roles</label>
            <div className="roles-checkboxes">
              {['Manager', 'Cashier', 'Cook', 'Waiter'].map((role) => (
                <label key={role} className="checkbox-label">
                  <input
                    type="checkbox"
                    value={role}
                    checked={formData.roles.includes(role)}
                    onChange={handleRoleChange}
                  />
                  <span>{role}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Auth + admin controls */}
          <div className="form-field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Login username"
              required={!employee}
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={employee ? 'Leave blank to keep current' : 'Temporary password'}
              required={!employee}
            />
          </div>

          <div className="form-field">
            <label className="checkbox-label" htmlFor="isAdmin">
              <input
                id="isAdmin"
                name="isAdmin"
                type="checkbox"
                checked={!!formData.isAdmin}
                onChange={handleChange}
              />
              <span>Grant Admin Access</span>
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => onClose?.()}>Cancel</button>
            <button type="submit">{employee ? 'Save' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;
