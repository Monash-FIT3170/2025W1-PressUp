// Card.js
import React from 'react';
import './Card.css'; // CSS for styling the card



const Card = ({ title, description, image }) => {
  return (
    <div className="card">
      {image && <img src={image} alt={title} className="card-image" />}
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-description">{description}</p>
        {/* <button onClick={() => setShowPopup(true)}>Edit Menu</button>
        {showPopup && <MenuItemPopUp onClose={() => setShowPopup(false)} addMenuItem={addMenuItem} />} */}
      </div>
    </div>
  );
};

export { Card };
