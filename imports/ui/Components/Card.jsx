// Card.js
import React from 'react';
import './Card.css'; // CSS for styling the card
import { Meteor } from 'meteor/meteor';



const handleClick = () => {
  Meteor.call('menu.insert', {menuItem: { name: "test2", price: 10 , menuCategory: "662fbc12d674ee8aa91ecf14",
        available: true,
        ingredients: []} }, (error, result) => {
    if (error) {
      console.error('Insert failed', error);
    } else {
      console.log('Row created with ID:', result);
    }
  });
};

const Card = ({ title, description, image }) => {
  return (
    <div className="card">
      {image && <img src={image} alt={title} className="card-image" />}
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-description">{description}</p>
        <button className="card-button" onClick={handleClick}>Order Now</button>
      </div>
    </div>
  );
};

export { Card };
