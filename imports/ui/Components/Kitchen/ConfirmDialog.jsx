import React from 'react';
import './ConfirmDialog.css';

const ConfirmDialog = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="confirm-overlay">
      <div className="confirm-box">
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="confirm-btn yes" onClick={onConfirm}>Yes</button>
          <button className="confirm-btn no" onClick={onCancel}>No</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
