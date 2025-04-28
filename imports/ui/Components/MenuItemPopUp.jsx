import React from 'react';
import './MenuItemPopUp.css'; // for styling

const MenuItemPopUp = ({ onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="close-button" onClick={onClose}>X</button>
        <h2>Popup Window</h2>
        <p>Add form here later...</p>
      </div>
    </div>
  );
};

export { MenuItemPopUp };
