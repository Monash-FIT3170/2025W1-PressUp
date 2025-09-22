import React from 'react';
import './PayDetails.css'; // styling for modal

export const PayDetails = ({ isOpen, onClose, employee, roleData, departmentName, startDate, endDate, totalHours }) => {
  if (!isOpen || !employee) return null;

  // Safely get role and department info
  const employmentType = employee.employment_type || 'X';
  const payPeriod = startDate && endDate 
    ? `${startDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })} - ${endDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}`
    : 'N/A';
  const role = roleData?.name || 'N/A';
  const department = departmentName || 'N/A';
  const payRate = roleData?.hourly_rate || 0; 
  const hoursWorked = totalHours;
  const subTotal = (payRate * totalHours).toFixed(2);
  const total = subTotal; // can add deductions later if needed

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
