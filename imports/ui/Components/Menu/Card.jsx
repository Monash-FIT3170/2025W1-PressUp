import React, { useState, useEffect } from "react";
import './Card.css';
import { MenuItemPopUp } from './MenuItemPopUp.jsx';
import { Meteor } from 'meteor/meteor';
import { ConfirmPopup } from "./ConfirmPopup.jsx";

const Card = ({ title, description, onDelete }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [item, setItem] = useState(null); // full menu item info
  const [showConfirm, setShowConfirm] = useState(false);

  // useEffect(() => {
  //   Meteor.call('menu.getByName', title, (error, result) => {
  //     if (!error && result) {
  //       console.log("Fetched menu item:", result);
  //       setItem(result);
  //     } else {
  //       console.warn("Failed to fetch item by name:", title, error);
  //     }
  //   });
  // }, [title]);
  

  const handleUpdate = (id, updatedData) => {
    setItem(prev => ({ ...prev, ...updatedData }));
    // Optional: add local cache update logic if needed
  };

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    setShowConfirm(false);
    onDelete();
  };
  
  const cancelDelete = () => {
    setShowConfirm(false);
  };

  return (
    <div className="card">
      {/* Optional: image rendering if your item has it */}
      {item?.image && <img src={item.image} alt={item.name} className="card-image" />}
      <div className="card-content">
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
          <button onClick={handleDeleteClick} className="trash-icon-button" title="Delete">
            🗑
          </button>
        </div>
        <p className="card-description">{description}</p>
        <button onClick={() => setShowPopup(true)}>Edit Menu</button>
        {showPopup && <MenuItemPopUp onClose={() => setShowPopup(false)} onUpdate={handleUpdate} mode ='update' existingItem={item} />}
        {showConfirm && (
          <ConfirmPopup
            message="Are you sure you want to delete this item?"
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
          />
        )}
        {/* {console.log("HI") && item && (
          <MenuItemPopUp
            mode="update"
            onClose={() => setShowPopup(false)}
            existingItem={item}
            onUpdate={handleUpdate}
          />
        )} */}
      </div>
    </div>
  );
};

export { Card };
