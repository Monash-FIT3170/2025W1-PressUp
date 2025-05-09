import React from "react";
import './Card.css';

const Card = ({ title, description, onEdit }) => {

  return (
    <div className="card">
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-description">{description}</p>
        <button onClick={onEdit}>Edit Menu</button>
      </div>
    </div>
  );
};

export { Card };
