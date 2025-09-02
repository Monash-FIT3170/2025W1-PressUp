import React, { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { EmployeesCollection } from '../../../api/payroll/employee/employees-collection.js';
import { RosterItemsCollection } from '../../../api/payroll/roster/rosteritem-collection.js';
import { DepartmentsCollection } from '../../../api/payroll/departments/departments-collection.js';
import { RolesCollection } from '../../../api/payroll/roles/roles-collection.js';
import './RosterItemForm.css';

export const RosterItemForm = ({ isOpen, onClose, initialData = null }) => {
  const [formData, setFormData] = useState({
    employee_id: '',
    date: '',
    startTime: '09:00',
    endTime: '17:00',
    shift_type: 'Normal',
    department_id: '',
    role_id: '',
    status: 'confirmed',
    break_duration: 0,
    notes: ''
  });

  const [errors, setErrors] = useState({});

  // Fetch employees for the dropdown
  const { employees, isLoading: employeesLoading } = useTracker(() => {
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

  // Fetch departments for the dropdown
  const { departments, isLoading: departmentsLoading } = useTracker(() => {
    const subscription = Meteor.subscribe('departments.all');
    
    if (!subscription.ready()) {
      return { departments: [], isLoading: true };
    }

    try {
      const departmentsData = DepartmentsCollection.find({}, { sort: { name: 1 } }).fetch();
      return { departments: departmentsData, isLoading: false };
    } catch (err) {
      return { departments: [], isLoading: false };
    }
  });

  // Fetch roles for the dropdown
  const { roles, isLoading: rolesLoading } = useTracker(() => {
    const subscription = Meteor.subscribe('roles.all');
    
    if (!subscription.ready()) {
      return { roles: [], isLoading: true };
    }

    try {
      const rolesData = RolesCollection.find({}, { sort: { name: 1 } }).fetch();
      return { roles: rolesData, isLoading: false };
    } catch (err) {
      return { roles: [], isLoading: false };
    }
  });

  // Set initial data if editing
  useEffect(() => {
    if (initialData) {
      // Convert date to YYYY-MM-DD format if it's a Date object
      let dateString = '';
      if (initialData.date) {
        if (initialData.date instanceof Date) {
          dateString = initialData.date.toISOString().split('T')[0];
        } else if (typeof initialData.date === 'string') {
          // If it's already a string, use it directly
          dateString = initialData.date;
        }
      }

      // Convert start_time and end_time to HH:MM format if they're Date objects
      let startTimeString = '09:00';
      let endTimeString = '17:00';
      
      if (initialData.start_time) {
        if (initialData.start_time instanceof Date) {
          startTimeString = initialData.start_time.toTimeString().slice(0, 5);
        } else if (typeof initialData.start_time === 'string') {
          startTimeString = initialData.start_time;
        }
      }
      
      if (initialData.end_time) {
        if (initialData.end_time instanceof Date) {
          endTimeString = initialData.end_time.toTimeString().slice(0, 5);
        } else if (typeof initialData.end_time === 'string') {
          endTimeString = initialData.end_time;
        }
      }

      setFormData({
        employee_id: initialData.employee_id || '',
        date: dateString,
        startTime: startTimeString,
        endTime: endTimeString,
        shift_type: initialData.shift_type || 'Normal',
        department_id: initialData.department_id || '',
        role_id: initialData.role_id || '',
        status: initialData.status || 'confirmed',
        break_duration: initialData.break_duration || 0,
        notes: initialData.notes || ''
      });
    }
  }, [initialData]);

  // Reset form when opening
  useEffect(() => {
    if (isOpen && !initialData) {
      setFormData({
        employee_id: '',
        date: '',
        startTime: '09:00',
        endTime: '17:00',
        shift_type: 'Normal',
        department_id: '',
        role_id: '',
        status: 'confirmed',
        break_duration: 0,
        notes: ''
      });
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // If department changes, reset role selection
    if (name === 'department_id') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        role_id: '' // Reset role when department changes
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
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

    if (!formData.employee_id) {
      newErrors.employee_id = 'Employee is required';
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

    if (!formData.shift_type) {
      newErrors.shift_type = 'Shift type is required';
    }

    if (!formData.department_id) {
      newErrors.department_id = 'Department is required';
    }

    if (!formData.role_id) {
      newErrors.role_id = 'Role is required';
    }

    if (formData.break_duration < 0 || formData.break_duration > 480) {
      newErrors.break_duration = 'Break duration must be between 0 and 480 minutes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        // Convert date and time strings to Date objects
        const dateObj = new Date(formData.date);
        const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
        const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

        const rosterData = {
          employee_id: formData.employee_id,
          date: dateObj,
          start_time: startDateTime,
          end_time: endDateTime,
          shift_type: formData.shift_type,
          department_id: formData.department_id,
          role_id: formData.role_id,
          status: formData.status,
          break_duration: parseInt(formData.break_duration) || 0,
          notes: formData.notes || ''
        };

        if (initialData && initialData._id) {
          // Update existing roster item
          await Meteor.callAsync('rosteritems.update', initialData._id, rosterData);
        } else {
          // Create new roster item
          await Meteor.callAsync('rosteritems.insert', rosterData);
        }

        onClose();
      } catch (error) {
        console.error('Error saving roster item:', error);
        // Handle specific error types
        if (error.error === 'conflict-error') {
          setErrors({ general: 'This shift conflicts with an existing roster item for this employee.' });
        } else if (error.error === 'validation-error') {
          setErrors({ general: 'Please check all required fields are filled correctly.' });
        } else {
          setErrors({ general: 'Failed to save roster item. Please try again.' });
        }
      }
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  // Helper function to get roles for the selected department
  const getRolesForDepartment = (departmentId) => {
    if (!departmentId) return [];
    return roles.filter(role => role.department_id === departmentId);
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
          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="employee_id">Employee *</label>
              <select
                id="employee_id"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleInputChange}
                className={errors.employee_id ? 'error' : ''}
                disabled={employeesLoading}
              >
                <option value="">Select an employee</option>
                {employees.map(employee => (
                  <option key={employee._id} value={employee._id}>
                    {employee.first_name} {employee.last_name}
                  </option>
                ))}
              </select>
              {errors.employee_id && <span className="error-message">{errors.employee_id}</span>}
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
              <label htmlFor="shift_type">Shift Type *</label>
              <select
                id="shift_type"
                name="shift_type"
                value={formData.shift_type}
                onChange={handleInputChange}
                className={errors.shift_type ? 'error' : ''}
              >
                <option value="Normal">Normal</option>
                <option value="Annual Leave">Annual Leave</option>
                <option value="Personal Leave">Personal Leave</option>
                <option value="Long Service Leave">Long Service Leave</option>
              </select>
              {errors.shift_type && <span className="error-message">{errors.shift_type}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="department_id">Department *</label>
              <select
                id="department_id"
                name="department_id"
                value={formData.department_id}
                onChange={handleInputChange}
                className={errors.department_id ? 'error' : ''}
                disabled={departmentsLoading}
              >
                <option value="">Select a department</option>
                {departments.map(department => (
                  <option key={department._id} value={department._id}>
                    {department.name}
                  </option>
                ))}
              </select>
              {errors.department_id && <span className="error-message">{errors.department_id}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="role_id">Role *</label>
              <select
                id="role_id"
                name="role_id"
                value={formData.role_id}
                onChange={handleInputChange}
                className={errors.role_id ? 'error' : ''}
                disabled={rolesLoading || !formData.department_id}
              >
                <option value="">
                  {!formData.department_id 
                    ? "Select a department first" 
                    : "Select a role"
                  }
                </option>
                {getRolesForDepartment(formData.department_id).map(role => (
                  <option key={role._id} value={role._id}>
                    {role.name}
                  </option>
                ))}
              </select>
              {errors.role_id && <span className="error-message">{errors.role_id}</span>}
              {formData.department_id && getRolesForDepartment(formData.department_id).length === 0 && (
                <span className="info-message">No roles available for this department</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="unconfirmed">Unconfirmed</option>
                <option value="confirmed">Confirmed</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="break_duration">Break Duration (minutes)</label>
              <input
                type="number"
                id="break_duration"
                name="break_duration"
                value={formData.break_duration}
                onChange={handleInputChange}
                min="0"
                max="480"
                placeholder="0"
                className={errors.break_duration ? 'error' : ''}
              />
              {errors.break_duration && <span className="error-message">{errors.break_duration}</span>}
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
