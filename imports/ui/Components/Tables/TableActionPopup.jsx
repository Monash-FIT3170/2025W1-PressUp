import React from 'react';
import { Meteor } from 'meteor/meteor';
import './TableActionPopup.css';

export function TableActionPopup({ tableId, onClose }) {
  // now inside the popup we know the tableId
  const handleCheckIn = () => {
    Meteor.call('tables.updateStatus', tableId, 'available', (err) => {
      if (err) alert(err.reason);
      onClose();
    });
  };

  const handleCheckOut = () => {
    Meteor.call('tables.updateStatus', tableId, 'checked-in', (err) => {
      if (err) alert(err.reason);
      onClose();
    });
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-container" onClick={e => e.stopPropagation()}>
        <div className="popup-buttons">
          <button
            className="popup-button popup-button--primary"
            onClick={handleCheckIn}
          >
            Check in
          </button>
          <button
            className="popup-button popup-button--primary"
            onClick={handleCheckOut}
          >
            Check out
          </button>
        </div>
        <button
          className="popup-button popup-button--cancel"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
