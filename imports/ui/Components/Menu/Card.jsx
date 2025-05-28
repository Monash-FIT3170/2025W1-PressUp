import React, { useState } from "react";
import './Card.css';
import { MenuItemPopUp } from './MenuItemPopUp.jsx';
import { Meteor } from 'meteor/meteor';
import { ConfirmPopup } from "./ConfirmPopup.jsx";

const Card = ({ title, description, onDelete, onEdit }) => {
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
      <div className="card-content">
        <div className="card-info">
          <h3 className="card-title">{title}</h3>
          <p className="card-description">{description}</p>
        </div>
        <div className="card-actions-header">
          <button onClick={onEdit} className="edit-button" title="Edit"><img src="/images/EditIcon.svg" alt="Edit" /></button>
          <button onClick={handleDeleteClick} className="trash-icon-button" title="Delete">
            🗑
          </button>
        </div>
      </div>
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
  );
};

export { Card };
