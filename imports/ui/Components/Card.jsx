// Card.js
import React from 'react';
import './Card.css'; // CSS for styling the card

const Card = ({ title, description, image, onDelete }) => {

  const handleDeleteClick = () => {
    const confirmed = window.confirm('Are you sure you want to delete this item?');
    if (confirmed) {
      onDelete();
    }
  };

  return (
    <div className="card">
      {image && <img src={image} alt={title} className="card-image" />}
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-description">{description}</p>
        <button onClick={handleDeleteClick} className="delete-button">Delete</button>
      </div>
    </div>
  );
};

export { Card };
