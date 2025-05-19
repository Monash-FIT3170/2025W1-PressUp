import React, { useState } from "react";
import './ItemCard.css';
import { Meteor } from 'meteor/meteor';

const Card = ({ title, description, onDelete, onEdit, available = true}) => {
  const [showPopup, setShowPopup] = useState(false);
  const [item, setItem] = useState(null); // full menu item info
  const [showConfirm, setShowConfirm] = useState(false);
  const cardClass = `card ${available ? '' : 'card-disabled'}`;

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
    <div className={cardClass}>
      <div className="card-content">
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
        </div>
        <p className="card-description">{description}
        <button onClick>+</button>
        </p>
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
