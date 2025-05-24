import React, { useState } from "react";
import './ItemCard.css';
import { Meteor } from 'meteor/meteor';

const ItemCard = ({ name, price, ingredients, onButtonClick, isHalal, isVegetarian, isGlutenFree, onAddToOrder, available = true }) => {
  const [showExtraInfo, setShowExtraInfo] = useState(false);
  const cardClass = `card ${available ? '' : 'card-disabled'}`;

  const toggleExtraInfo = () => setShowExtraInfo(v => !v);
  
  const handleAddToOrder = () => {
    if (onAddToOrder) {
      onAddToOrder();
    }
  };

  return (
    <div className={cardClass} onClick={toggleExtraInfo}>
      <div className="card-content">
        <div className="card-header">
          <h3 className="card-title">{name}</h3>
        </div>
        <p className="card-description">
          <span className="price">{price}</span>
          <button 
            className="add-to-order-btn" 
            onClick={handleAddToOrder}
          >+</button>
        </p>
        {showExtraInfo && (<>
            <div className="card-dietary">
              {isHalal && <strong>H </strong>}
              {isVegetarian && <strong>V </strong>}
              {isGlutenFree && <strong>GF </strong>}
            </div>
            <p className="card-ingredients">
              {ingredients.join(", ")}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export { ItemCard };
