import React, { useState } from "react";
import "./ItemCard.css";
import { Meteor } from "meteor/meteor";

const ItemCard = ({
  name,
  price,
  discountedPrice = null,
  ingredients,
  isHalal,
  isVegetarian,
  isGlutenFree,
  onAddToOrder,
  available = true,
  seasonal = false,
  inSeason = true
}) => {
  const [showExtraInfo, setShowExtraInfo] = useState(false);
  if (seasonal && !inSeason) {
    return <></>
  }

  const toggleExtraInfo = () => setShowExtraInfo(v => !v);

  const handleAddToOrder = (e) => {
    e.stopPropagation();
    if (onAddToOrder) onAddToOrder();
  };

  return (
    <div
      className={`item-card ${available ? "" : "card-disabled"}`}
      onClick={toggleExtraInfo}
    >
      {/* HEADER: title + add-button */}
      <div className="card-header">
        <h3>{name}</h3>
        <button
          className="add-button"
          onClick={handleAddToOrder}
          disabled={!available}
          aria-disabled={!available}
        >
          +
        </button>
      </div>

      {/* DESCRIPTION: price only */}
      <div className="card-description">
        <p className="price">
          Price:{" "}
            {discountedPrice !== null && discountedPrice < price ? (
              <>
                <span style={{ textDecoration: 'line-through', marginRight: 8 }}>
                  ${price.toFixed(2)}
                </span>
                <span>
                  ${discountedPrice.toFixed(2)}
                </span>
              </>
            ) : (
              <span>${price.toFixed(2)}</span>
            )}
        </p>
      </div>

      {/* EXTRA INFO: dietary badges + ingredients */}
      {showExtraInfo && (
        <div className="extraInformation">
          <div className="diet-badges">
            {isHalal       && <span className="badge">H</span>}
            {isVegetarian && <span className="badge">V</span>}
            {isGlutenFree && <span className="badge">GF</span>}
          </div>
          <p className="ingredients">
            {ingredients.join(", ")}
          </p>
        </div>
      )}
    </div>
  );
};

export { ItemCard };
