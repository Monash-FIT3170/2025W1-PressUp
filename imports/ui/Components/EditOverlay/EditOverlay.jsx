import React from "react";
import { Meteor } from "meteor/meteor";
import "./EditOverlay.css";

export const EditOverlay = ({ ingredientName, edittingIngredient, onEdit }) => {
  const handleDeleteIngredient = async () => {
    if (window.confirm("Are you sure you want to delete this ingredient?")) {
      try {
        await Meteor.callAsync("inventory.remove", ingredientName);
      } catch (error) {
        console.error("Failed to delete ingredient:", error);
        alert(`Failed to delete ingredient: ${error.message}`);
      }
    }
  };

  return (
    <div className="edit-overlay">
      <button className="edit-overlay-btn" onClick={() => onEdit(edittingIngredient)}>
        <img src="/images/EditIcon.svg" alt="Edit" />
        <span>Edit</span>
      </button>
      <button className="edit-overlay-btn">
        <img src="/images/AddIcon.svg" alt="Resupply" />
        <span>Resupply</span>
      </button>
      <button className="edit-overlay-btn" onClick={handleDeleteIngredient}>
        <img src="/images/DeleteIcon.svg" alt="Edit" />
        <span id="delete">Delete</span>
      </button>
    </div>
  );
};
