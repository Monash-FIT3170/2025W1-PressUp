import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { DepartmentsCollection } from '../../../api/payroll/departments/departments-collection.js';
import { RolesCollection } from '../../../api/payroll/roles/roles-collection.js';
import './OrgStructure.css';

export const OrgStructure = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDepartmentForm, setShowDepartmentForm] = useState(false);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [departmentFormData, setDepartmentFormData] = useState({
    name: '',
    code: '',
    description: '',
    level: 1,
    color: '#3b82f6'
  });
  const [roleFormData, setRoleFormData] = useState({
    name: '',
    description: '',
    department_id: '',
    level: 1,
    hourly_rate: ''
  });

  // Subscribe to departments and roles
  const { departments, isLoading: departmentsLoading } = useTracker(() => {
    const subscription = Meteor.subscribe('departments.all');
    
    if (!subscription.ready()) {
      return { departments: [], isLoading: true };
    }

    try {
      const departmentsData = DepartmentsCollection.find({}, { sort: { level: 1, name: 1 } }).fetch();
      return { departments: departmentsData, isLoading: false };
    } catch (err) {
      console.error('Error fetching departments:', err);
      return { departments: [], isLoading: false };
    }
  });

  const { roles, isLoading: rolesLoading } = useTracker(() => {
    const subscription = Meteor.subscribe('roles.all');
    
    if (!subscription.ready()) {
      return { roles: [], isLoading: true };
    }

    try {
      const rolesData = RolesCollection.find({}, { sort: { name: 1 } }).fetch();
      return { roles: rolesData, isLoading: false };
    } catch (err) {
      console.error('Error fetching roles:', err);
      return { roles: [], isLoading: false };
    }
  });

  const handleToggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleCloseMenu = () => {
    setShowMenu(false);
  };

  const handleCreateDepartment = () => {
    setEditingDepartment(null);
    setDepartmentFormData({
      name: '',
      code: '',
      description: '',
      level: 1,
      color: '#3b82f6'
    });
    setShowDepartmentForm(true);
    setShowMenu(false);
  };

  const handleCreateRole = () => {
    setEditingRole(null);
    setRoleFormData({
      name: '',
      description: '',
      department_id: '',
      level: 1,
      hourly_rate: ''
    });
    setShowRoleForm(true);
    setShowMenu(false);
  };

  const handleEditDepartment = (department) => {
    setEditingDepartment(department);
    setDepartmentFormData({
      name: department.name,
      code: department.code || '',
      description: department.description || '',
      level: department.level,
      color: department.color || '#3b82f6'
    });
    setShowDepartmentForm(true);
    setShowMenu(false);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setRoleFormData({
      name: role.name,
      description: role.description || '',
      department_id: role.department_id || '',
      level: role.level,
      hourly_rate: role.hourly_rate || ''
    });
    setShowRoleForm(true);
    setShowMenu(false);
  };

  const handleDeleteDepartment = async (departmentId) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await Meteor.callAsync('departments.remove', departmentId);
        console.log('Department deleted successfully');
      } catch (error) {
        console.error('Error deleting department:', error);
        alert('Error deleting department: ' + error.message);
      }
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await Meteor.callAsync('roles.remove', roleId);
        console.log('Role deleted successfully');
      } catch (error) {
        console.error('Error deleting role:', error);
        alert('Error deleting role: ' + error.message);
      }
    }
  };

  const handleDepartmentSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingDepartment) {
        await Meteor.callAsync('departments.update', editingDepartment._id, departmentFormData);
        console.log('Department updated successfully');
      } else {
        await Meteor.callAsync('departments.insert', departmentFormData);
        console.log('Department created successfully');
      }
      setShowDepartmentForm(false);
      setEditingDepartment(null);
    } catch (error) {
      console.error('Error saving department:', error);
      alert('Error saving department: ' + error.message);
    }
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const roleData = {
        ...roleFormData,
        hourly_rate: roleFormData.hourly_rate ? parseFloat(roleFormData.hourly_rate) : null
      };

      if (editingRole) {
        await Meteor.callAsync('roles.update', editingRole._id, roleData);
        console.log('Role updated successfully');
      } else {
        await Meteor.callAsync('roles.insert', roleData);
        console.log('Role created successfully');
      }
      setShowRoleForm(false);
      setEditingRole(null);
    } catch (error) {
      console.error('Error saving role:', error);
      alert('Error saving role: ' + error.message);
    }
  };

  const handleCloseDepartmentForm = () => {
    setShowDepartmentForm(false);
    setEditingDepartment(null);
  };

  const handleCloseRoleForm = () => {
    setShowRoleForm(false);
    setEditingRole(null);
  };

  return (
    <div className="org-structure-container">
      <button 
        className="org-structure-btn"
        onClick={handleToggleMenu}
      >
        Org Structure
      </button>

      {showMenu && (
        <div className="org-structure-menu">
          <div className="menu-header">
            <h3>Organization Structure</h3>
            <button className="close-menu-btn" onClick={handleCloseMenu}>×</button>
          </div>
          
          <div className="menu-content">
            <div className="menu-section">
              <h4>Departments</h4>
              <button className="menu-action-btn" onClick={handleCreateDepartment}>
                + Add Department
              </button>
              
              {departmentsLoading ? (
                <div className="loading">Loading departments...</div>
              ) : (
                <div className="items-list">
                  {departments.map((department) => (
                    <div key={department._id} className="item-row">
                      <div className="item-info">
                        <span className="item-name">{department.name}</span>
                        {department.code && (
                          <span className="item-code">({department.code})</span>
                        )}
                      </div>
                      <div className="item-actions">
                        <button 
                          className="edit-btn"
                          onClick={() => handleEditDepartment(department)}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteDepartment(department._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="menu-section">
              <h4>Roles</h4>
              <button className="menu-action-btn" onClick={handleCreateRole}>
                + Add Role
              </button>
              
              {rolesLoading ? (
                <div className="loading">Loading roles...</div>
              ) : (
                <div className="items-list">
                  {roles.map((role) => (
                    <div key={role._id} className="item-row">
                      <div className="item-info">
                        <span className="item-name">{role.name}</span>
                        {role.department_id && (
                          <span className="item-department">
                            ({departments.find(d => d._id === role.department_id)?.name || 'Unknown Dept'})
                          </span>
                        )}
                      </div>
                      <div className="item-actions">
                        <button 
                          className="edit-btn"
                          onClick={() => handleEditRole(role)}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteRole(role._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Department Form Modal */}
      {showDepartmentForm && (
        <div className="form-modal-overlay" onClick={handleCloseDepartmentForm}>
          <div className="form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="form-modal-header">
              <h3>{editingDepartment ? 'Edit Department' : 'Create Department'}</h3>
              <button className="close-modal-btn" onClick={handleCloseDepartmentForm}>×</button>
            </div>
            <form onSubmit={handleDepartmentSubmit} className="form-modal-content">
              <div className="form-group">
                <label>Department Name *</label>
                <input
                  type="text"
                  value={departmentFormData.name}
                  onChange={(e) => setDepartmentFormData({...departmentFormData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Department Code</label>
                <input
                  type="text"
                  value={departmentFormData.code}
                  onChange={(e) => setDepartmentFormData({...departmentFormData, code: e.target.value})}
                  maxLength="10"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={departmentFormData.description}
                  onChange={(e) => setDepartmentFormData({...departmentFormData, description: e.target.value})}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Level</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={departmentFormData.level}
                  onChange={(e) => setDepartmentFormData({...departmentFormData, level: parseInt(e.target.value)})}
                />
              </div>
              <div className="form-group">
                <label>Color</label>
                <input
                  type="color"
                  value={departmentFormData.color}
                  onChange={(e) => setDepartmentFormData({...departmentFormData, color: e.target.value})}
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={handleCloseDepartmentForm}>Cancel</button>
                <button type="submit">{editingDepartment ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Form Modal */}
      {showRoleForm && (
        <div className="form-modal-overlay" onClick={handleCloseRoleForm}>
          <div className="form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="form-modal-header">
              <h3>{editingRole ? 'Edit Role' : 'Create Role'}</h3>
              <button className="close-modal-btn" onClick={handleCloseRoleForm}>×</button>
            </div>
            <form onSubmit={handleRoleSubmit} className="form-modal-content">
              <div className="form-group">
                <label>Role Name *</label>
                <input
                  type="text"
                  value={roleFormData.name}
                  onChange={(e) => setRoleFormData({...roleFormData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={roleFormData.description}
                  onChange={(e) => setRoleFormData({...roleFormData, description: e.target.value})}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <select
                  value={roleFormData.department_id}
                  onChange={(e) => setRoleFormData({...roleFormData, department_id: e.target.value})}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Level</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={roleFormData.level}
                  onChange={(e) => setRoleFormData({...roleFormData, level: parseInt(e.target.value)})}
                />
              </div>
              <div className="form-group">
                <label>Hourly Rate</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={roleFormData.hourly_rate}
                  onChange={(e) => setRoleFormData({...roleFormData, hourly_rate: e.target.value})}
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={handleCloseRoleForm}>Cancel</button>
                <button type="submit">{editingRole ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
