import React, { useState } from 'react';
import { EmployeeTable } from './EmployeeTable.jsx';  
import { RosterManager } from './RosterManager.jsx';
import './Scheduling.css';

export const Scheduling = () => {
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);

  const handleViewEmployees = () => {
    setShowEmployeeModal(true);
  };

  const handleCloseEmployeeModal = () => {
    setShowEmployeeModal(false);
  };

  return (
    <div className="scheduling-container">
      
      <div className="scheduling-content">
        <div className="scheduling-actions">
          <button 
            className="view-employees-btn"
            onClick={handleViewEmployees}
          >
            Manage Employees
          </button>
        </div>
        
        <div className="scheduling-main-content">
          {/* Future scheduling components will go here */}
          <RosterManager />
        </div>
      </div>

      {/* Employee Modal */}
      {showEmployeeModal && (
        <div className="employee-modal-overlay" onClick={handleCloseEmployeeModal}>
          <div className="employee-modal" onClick={(e) => e.stopPropagation()}>
            <div className="employee-modal-header">
              <h2>Employee Management</h2>
              <button 
                className="close-modal-btn"
                onClick={handleCloseEmployeeModal}
              >
                ×
              </button>
            </div>
            <div className="employee-modal-content">
              <EmployeeTable />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
