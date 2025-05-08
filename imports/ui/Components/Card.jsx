// Card.js
// Menu item card
import React from 'react';
import './Card.css'; // CSS for styling the card

const Card = ({ title, description, image, onButtonClick }) => {
  return (
    <div className="card">
      <button className="card-button" onClick={onButtonClick}>+</button>
      {image && <img src={image} alt={title} className="card-image" />}
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-description">{description}</p>
      </div>
    </div>
  );
};

export { Card };
