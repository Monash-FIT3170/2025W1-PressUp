import React, { useState, useCallback, useMemo } from "react";
import "./IngredientTable.css";
import { EditOverlay } from "../EditOverlay/EditOverlay.jsx";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { InventoryCollection } from "../../../api/inventory/inventory-collection.js";
import { LoadingIndicator } from "../LoadingIndicator/LoadingIndicator.jsx";
import { capitalizeFirstLetter } from "../../../utils/utils.js";
import { IngredientForm } from "./IngredientForm.jsx";

export const IngredientTable = ({
  searchTerm = "",
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

  const handleEditIngredient = useCallback(
    (ingredient) => {
      setEditingIngredient(ingredient);
      setShowEditModal(true);
      setOpenOverlay(null);
    },
    [setEditingIngredient, setOpenOverlay]
  );

  const expiredIngredients = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset to start of day for fair comparison
    const expired = [];

    ingredients.forEach((ingredient) => {
      console.log("Checking ingredient for expiry:", ingredient.useByDate);
      if (ingredient.useByDate) {
        const useBy = new Date(ingredient.useByDate);
        useBy.setHours(0, 0, 0, 0);
        if (useBy < now) {
          expired.push(ingredient);
        }
      }
    });

    return expired;
  }, [ingredients]);

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
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
          {searchTerm
            ? `No ingredients found matching "${searchTerm}"`
            : 'No ingredients found. Click the "+" button to add one.'}
        </div>

        {showAddModal && (
          <IngredientForm
            mode="add"
            onClose={() => setShowAddModal(false)}
          />
        )}
      </>
    );
  }

  // Create custom headers, excluding _id and useByDate from auto-generation
  var headers = Object.keys(ingredients[0])
    .filter((header) => header !== "_id" && header !== "useByDate")
    .map((header) => capitalizeFirstLetter(header));
  
  // Add Use By Date and Actions columns manually
  headers.push("Use By Date");
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

      <h2>Ingredients Table</h2>

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
              <td>{formatDate(ingredient.useByDate)}</td>
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
                      <EditOverlay
                        edittingIngredient={ingredient}
                        onEdit={handleEditIngredient}
                        ingredientName={ingredient.name}
                      />
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="expired-section" style={{ marginTop: "2rem" }}>
        Expired Ingredients ({expiredIngredients.length})
      </h2>

      {expiredIngredients.length > 0 ? (
        <table className="ingredient-table">
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {expiredIngredients.map((ingredient, ingredientIndex) => (
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
                <td>{formatDate(ingredient.useByDate)}</td>
                <td>
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={() =>
                        setOpenOverlay(
                          openOverlay === `expired-${ingredientIndex}`
                            ? null
                            : `expired-${ingredientIndex}`
                        )
                      }
                    >
                      <img src="/images/MoreIcon.svg" alt="More button" />
                    </button>
                    {openOverlay === `expired-${ingredientIndex}` && (
                      <div ref={overlayRef}>
                        <EditOverlay
                          edittingIngredient={ingredient}
                          onEdit={handleEditIngredient}
                          ingredientName={ingredient.name}
                        />
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-results">No expired ingredients</div>
      )}

      {showAddModal && (
        <IngredientForm mode="add" onClose={() => setShowAddModal(false)} />
      )}

      {showEditModal && editingIngredient && (
        <IngredientForm
          mode="edit"
          existingIngredient={editingIngredient}
          onClose={() => {
            setShowEditModal(false);
            setEditingIngredient(null);
          }}
        />
      )}
    </>
  );
};