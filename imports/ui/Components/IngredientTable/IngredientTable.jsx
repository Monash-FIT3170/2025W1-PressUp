import React from "react";
import "./IngredientTable.css";
import { EditOverlay } from "../EditOverlay/EditOverlay.jsx";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { InventoryCollection } from "../../../api/inventory/inventory-collection.js";
import { LoadingIndicator } from "../LoadingIndicator/LoadingIndicator.jsx";
import { capitalizeFirstLetter } from "../../../utils/utils.js";

export const IngredientTable = ({
  searchTerm = '',
  openOverlay,
  setOpenOverlay,
  overlayRef,
}) => {
  const isLoading = useSubscribe("inventory.nameStartsWith", searchTerm);
  const ingredients = useFind(() => InventoryCollection.find({}), [searchTerm]);

  if (isLoading()) {
    return <LoadingIndicator />;
  }

  if (!ingredients || ingredients.length === 0) {
    return (
      <div className="no-results">
        {searchTerm ? 
          `No ingredients found matching "${searchTerm}"` : 
          'No ingredients found'
        }
      </div>
    );
  }

  var headers = Object.keys(ingredients[0])
    .filter((header) => header !== "_id")
    .map((header) => capitalizeFirstLetter(header));
  headers.push("");

  return (
    <table className="ingredient-table">
      <thead>
        <tr>
          {headers.map((header, index) => (
            <th key={index}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {ingredients.map((ingredient, ingredientIndex) => (
          <tr key={ingredient._id}>
            <td>{ingredient.name}</td>
            <td>
              <div className="number-pill">{ingredient.quantity}</div>
            </td>
            <td>{ingredient.units}</td>
            <td>
              <div className="number-pill">{ingredient.price}</div>
            </td>
            <td>{ingredient.supplier}</td>
            <td>
              <div style={{ position: "relative" }}>
                <button
                  onClick={() =>
                    setOpenOverlay(
                      openOverlay === `ingredient-${ingredientIndex}`
                        ? null
                        : `ingredient-${ingredientIndex}`
                    )
                  }
                >
                  <img src="/images/MoreIcon.svg" alt="More button" />
                </button>
                {openOverlay === `ingredient-${ingredientIndex}` && (
                  <div ref={overlayRef}>
                    <EditOverlay />
                  </div>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};