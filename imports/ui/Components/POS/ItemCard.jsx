import React, { useState } from "react";
import './ItemCard.css';
import { Meteor } from 'meteor/meteor';

const ItemCard = ({ name, price, ingredients, onButtonClick, isHalal, isVegetarian, isGlutenFree}) => {
  const [showExtraInfo, setShowExtraInfo] = useState(false);

  const toggleExtraInfo = () => setShowExtraInfo(v => !v);

  return (
    <div className="card" onClick={toggleExtraInfo}>
      <div className="card-content">
        <div className="card-header">
          <h3 className="card-title">{name}</h3>
        </div>
        <p className="card-description">
          <span className="price">{price}</span>
          <button
            className="add-button"
            onClick={e => {
              e.stopPropagation();
              onButtonClick && onButtonClick();
            }}
          >
            +
          </button>
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
