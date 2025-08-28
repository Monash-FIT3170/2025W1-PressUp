import React, { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { EmployeesCollection } from '../../../api/payroll/employee/employees-collection.js';
import './RosterItemForm.css';

export const RosterItemForm = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    date: '',
    startTime: '09:00',
    endTime: '17:00',
    department: '',
    role: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  // Fetch employees for the dropdown
  const { employees, isLoading } = useTracker(() => {
    const subscription = Meteor.subscribe('Employees');
    
    if (!subscription.ready()) {
      return { employees: [], isLoading: true };
    }

    try {
      const employeesData = EmployeesCollection.find().fetch();
      return { employees: employeesData, isLoading: false };
    } catch (err) {
      return { employees: [], isLoading: false };
    }
  });

  // Set initial data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        employeeId: initialData.employeeId || '',
        date: initialData.date || '',
        startTime: initialData.startTime || '09:00',
        endTime: initialData.endTime || '17:00',
        department: initialData.department || '',
        role: initialData.role || '',
        notes: initialData.notes || ''
      });
    }
  }, [initialData]);

  // Reset form when opening
  useEffect(() => {
    if (isOpen && !initialData) {
      setFormData({
        employeeId: '',
        date: '',
        startTime: '09:00',
        endTime: '17:00',
        department: '',
        role: '',
        notes: ''
      });
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.employeeId) {
      newErrors.employeeId = 'Employee is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (formData.startTime >= formData.endTime) {
      newErrors.endTime = 'End time must be after start time';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="roster-form-overlay" onClick={handleClose}>
      <div className="roster-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="roster-form-header">
          <h2>{initialData ? 'Edit Shift' : 'Add New Shift'}</h2>
          <button 
            className="close-form-btn"
            onClick={handleClose}
            aria-label="Close form"
          >
            ×
          </button>
        </div>

        <form className="roster-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="employeeId">Employee *</label>
              <select
                id="employeeId"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleInputChange}
                className={errors.employeeId ? 'error' : ''}
                disabled={isLoading}
              >
                <option value="">Select an employee</option>
                {employees.map(employee => (
                  <option key={employee._id} value={employee._id}>
                    {employee.first_name} {employee.last_name}
                  </option>
                ))}
              </select>
              {errors.employeeId && <span className="error-message">{errors.employeeId}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className={errors.date ? 'error' : ''}
              />
              {errors.date && <span className="error-message">{errors.date}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startTime">Start Time *</label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                className={errors.startTime ? 'error' : ''}
              />
              {errors.startTime && <span className="error-message">{errors.startTime}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="endTime">End Time *</label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                className={errors.endTime ? 'error' : ''}
              />
              {errors.endTime && <span className="error-message">{errors.endTime}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="department">Department *</label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                placeholder="e.g., Front of House"
                className={errors.department ? 'error' : ''}
              />
              {errors.department && <span className="error-message">{errors.department}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="role">Role *</label>
              <input
                type="text"
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                placeholder="e.g., Waiter"
                className={errors.role ? 'error' : ''}
              />
              {errors.role && <span className="error-message">{errors.role}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Additional notes about this shift..."
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn"
            >
              {initialData ? 'Update Shift' : 'Add Shift'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
