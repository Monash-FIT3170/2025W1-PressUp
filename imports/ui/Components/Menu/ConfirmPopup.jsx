import React from 'react';
import './ConfirmPopup.css';

export const ConfirmPopup = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="confirm-overlay">
      <div className="confirm-modal">
        <p>{message}</p>
        <div className="confirm-buttons">
          <button className="confirm-button" onClick={onConfirm}>Confirm</button>
          <button className="cancel-button" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};