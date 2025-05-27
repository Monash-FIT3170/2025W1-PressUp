import React, { useState, useCallback } from "react";
import "./IngredientTable.css";
import { EditOverlay } from "../EditOverlay/EditOverlay.jsx";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { InventoryCollection } from "../../../api/inventory/inventory-collection.js";
import { LoadingIndicator } from "../LoadingIndicator/LoadingIndicator.jsx";
import { capitalizeFirstLetter } from "../../../utils/utils.js";
import { IngredientForm } from "./IngredientForm.jsx";

export const IngredientTable = ({
  searchTerm = '',
  openOverlay,
  setOpenOverlay,
  overlayRef,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  
  // State for editing
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const isLoading = useSubscribe("inventory.nameIncludes", searchTerm);
  const ingredients = useFind(() => InventoryCollection.find({}), [searchTerm]);

  const handleEditIngredient = useCallback((ingredientId) => {
    const ingredientToEdit = ingredients.find(i => i._id === ingredientId);
    if (ingredientToEdit) {
      setEditingIngredient(ingredientToEdit);
      setShowEditModal(true);
      setOpenOverlay(null);
    }
  }, [ingredients, setOpenOverlay]);

  const handleIngredientUpdated = () => {
    // Refresh might be needed here
  };

  if (isLoading()) {
    return <LoadingIndicator />;
  }

  if (!ingredients || ingredients.length === 0) {
    return (
      <>
        <button
          className="add-supplier-btn"
          onClick={() => {
            setEditingIngredient(null);
            setShowAddModal(true);
          }}
        >
          +
        </button>
        
        <div className="no-results">
          {searchTerm ? 
            `No ingredients found matching "${searchTerm}"` : 
            'No ingredients found. Click the "+" button to add one.'
          }
        </div>

        {showAddModal && (
          <IngredientForm
            mode="add"
            onClose={() => setShowAddModal(false)}
            onIngredientUpdated={handleIngredientUpdated}
          />
        )}
      </>
    );
  }

  var headers = Object.keys(ingredients[0])
    .filter((header) => header !== "_id")
    .map((header) => capitalizeFirstLetter(header));
  headers.push("");

  return (
    <>
      <button
        className="add-supplier-btn"
        onClick={() => {
          setEditingIngredient(null);
          setShowAddModal(true);
        }}
      >
        +
      </button>

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
                      <EditOverlay ingredientName={ingredient.name} />
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showAddModal && (
        <IngredientForm
          mode="add"
          onClose={() => setShowAddModal(false)}
          onIngredientUpdated={handleIngredientUpdated}
        />
      )}

      {showEditModal && editingIngredient && (
        <IngredientForm
          mode="edit"
          existingIngredient={editingIngredient}
          onClose={() => {
            setShowEditModal(false);
            setEditingIngredient(null);
          }}
          onIngredientUpdated={handleIngredientUpdated}
        />
      )}
    </>
  );
};