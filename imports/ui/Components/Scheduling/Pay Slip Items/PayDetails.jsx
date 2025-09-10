import React from 'react';
import './PayDetails.css'; // styling for modal

export const PayDetails = ({ isOpen, onClose, employee }) => {
  if (!isOpen || !employee) return null;

  const firstRole = employee.roles[0];
  // Dummy values for now
  const employmentType = employee.employment_type || 'X';
  const payPeriod = 'X'; // replace with dynamic week dates later
  const department = firstRole.department || 'X';
  const role = employee.roles || 'X';
  const payRate = employee.pay_rate || 'X'; // per hour
  const hoursWorked = 'X'; // dummy value
  const subTotal = 'X'; //(payRate * hoursWorked).toFixed(2)
  const total = 'X'; // include deductions later if needed

  return (
    <div className="paydetails-backdrop" onClick={onClose}>
      <div 
        className="paydetails-modal" 
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Pay Details - {employee.first_name} {employee.last_name}</h2>

        <div className="pay-details-content">
          <p><strong>Employment type:</strong> {employmentType}</p>
          <p><strong>Pay period:</strong> {payPeriod}</p>
          <hr />
          <p><strong>Department:</strong> {department}</p>
          <p><strong>Role:</strong> {role}</p>
          <p><strong>Pay rate:</strong> ${payRate} / hour</p>
          <p><strong>Hours worked:</strong> {hoursWorked}</p>
          <p><strong>Sub-total:</strong> ${subTotal}</p>
          <hr />
          <p><strong>Total:</strong> ${total}</p>
        </div>

        <button className="paydetails-close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};
