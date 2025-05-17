import React, { useState } from "react";
import './ItemCard.css';
import { Meteor } from 'meteor/meteor';

const Card = ({ title, description, onDelete, onEdit, onAddToOrder }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [item, setItem] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleUpdate = (id, updatedData) => {
    setItem(prev => ({ ...prev, ...updatedData }));
  };

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    setShowConfirm(false);
    if (onDelete) onDelete();
  };
  
  const cancelDelete = () => {
    setShowConfirm(false);
  };
  
  const handleAddToOrder = () => {
    if (onAddToOrder) {
      onAddToOrder();
    }
  };

  return (
    <div className="card">
      <div className="card-content">
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
        </div>
        <div className="card-description-container">
          <p className="card-description">{description}</p>
          <button 
            className="add-to-order-btn" 
            onClick={handleAddToOrder}
          >+</button>
        </div>
      </div>
    </div>
  );
};

export { Card };