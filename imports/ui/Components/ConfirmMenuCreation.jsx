import React from 'react';
import './ConfirmMenuCreation.css';

export const ConfirmMenuCreation = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="confirm-overlay">
      <div className="confirm-modal">
        <p>{message}</p>
        <div className="confirm-buttons">
          <button className="confirm" onClick={onConfirm}>Confirm</button>
          <button className="cancel" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};