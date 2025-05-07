import React, { useState, useEffect } from "react";
import './Card.css';
import { MenuItemPopUp } from './MenuItemPopUp.jsx';
import { Meteor } from 'meteor/meteor';

const Card = ({ title, description }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [item, setItem] = useState(null); // full menu item info

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

  return (
    <div className="card">
      {/* Optional: image rendering if your item has it */}
      {item?.image && <img src={item.image} alt={item.name} className="card-image" />}
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-description">{description}</p>
        <button onClick={() => setShowPopup(true)}>Edit Menu</button>
        {showPopup && <MenuItemPopUp onClose={() => setShowPopup(false)} onUpdate={handleUpdate} mode ='update' existingItem={item} />}
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
