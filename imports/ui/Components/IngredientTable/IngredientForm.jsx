// imports/ui/Components/IngredientTable/IngredientForm.jsx
import React, { useState, useEffect } from "react";
import "./IngredientForm.css";
import { Meteor } from "meteor/meteor";

export const IngredientForm = ({
  onClose,
  mode = "add",
  existingIngredient = null,
}) => {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [units, setUnits] = useState("");
  const [price, setPrice] = useState("");
  const [suppliers, setSuppliers] = useState("");

  // Error states
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (mode === "edit" && existingIngredient) {
      setName(existingIngredient.name || "");
      setQuantity(existingIngredient.quantity || 0);
      setUnits(existingIngredient.units || "unit(s)");
      setPrice(existingIngredient.price || "");
      setSuppliers(
        existingIngredient.suppliers
          ? existingIngredient.suppliers.join(", ")
          : ""
      );
    } else {
      // Reset form for "add" mode or if no existing ingredient
      setName("");
      setQuantity(0);
      setUnits("");
      setPrice("");
      setSuppliers("");
    }
    // Clear errors when mode or ingredient changes
    setErrors({});
    setSubmitError("");
  }, [mode, existingIngredient]);

  const validateForm = () => {
    const newErrors = {};

    console.log("Validating form with values:", {
      name: name.trim(),
      quantity,
      units: units.trim(),
      price,
    }); // Debug log

    // Name validation
    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    // Quantity validation
    if (!quantity || quantity <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }

    // Units validation
    if (!units.trim()) {
      newErrors.units = "Units are required";
    }

    // Price validation
    if (!price || Number(price) < 0) {
      newErrors.price = "Price must be 0 or greater";
    }

    console.log("Validation errors:", newErrors); // Debug log
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Form submitted!"); // Debug log
    console.log("Current form values:", {
      name,
      quantity,
      units,
      price,
      suppliers,
    }); // Debug log

    // Clear previous errors
    setErrors({});
    setSubmitError("");

    // Validate form
    const isValid = validateForm();
    console.log("Form is valid:", isValid); // Debug log

    if (!isValid) {
      console.log("Validation failed, not submitting"); // Debug log
      return;
    }

    setIsSubmitting(true);

    const suppliersArray = suppliers
      .split(",")
      .map((supplier) => supplier.trim())
      .filter((supplier) => supplier);
    const ingredientData = {
      name: name.trim(),
      quantity: Number(quantity),
      units: units.trim(),
      price: Number(price),
      suppliers: suppliersArray,
    };

    try {
      if (mode === "edit" && existingIngredient?._id) {
        await Meteor.callAsync("inventory.update", {
          name: existingIngredient.name,
          inventoryItem: { $set: ingredientData },
        });
        alert("Ingredient updated successfully!");
      } else {
        await Meteor.callAsync("inventory.insert", ingredientData);
        alert("Ingredient added successfully!");
        // Reset form for next entry
        setName("");
        setQuantity(1);
        setUnits("unit(s)");
        setPrice("");
        setSuppliers("");
      }
      onClose();
    } catch (error) {
      console.error("Error processing ingredient:", error);
      setSubmitError(
        error.message || "Failed to save ingredient. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content ingredient-form-container">
        <div className="ingredient-form-header">
          <div className="title">
            {mode === "edit" ? "Edit Ingredient" : "Add New Ingredient"}
          </div>
        </div>

        {submitError && (
          <div className="submit-error-popup">
            <div className="error-icon">⚠️</div>
            <div className="error-text">{submitError}</div>
            <button
              className="error-close-btn"
              onClick={() => setSubmitError("")}
            >
              ×
            </button>
          </div>
        )}
        <form
          className="ingredient-form-input-container"
          onSubmit={handleSubmit}
        >
          {/* Name */}
          <div className="ingredient-form-input">
            <div className="Name field"></div>
            <label>Name</label>
            <input
              name="name"
              placeholder="Ingredient name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          {/* Quantity */}
          <div className="ingredient-form-input">
            <div className="Quantity field"></div>
            <label>Quantity</label>
            <input
              name="quantity"
              type="number"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="0"
              step="1"
              required
            />
          </div>
          {/* Units */}
          <div className="ingredient-form-input">
            <div className="Units field"></div>
            <label>Units</label>
            <input
              name="units"
              placeholder="e.g., kg, liters, pieces"
              value={units}
              onChange={(e) => setUnits(e.target.value)}
            />
          </div>
          {/* Price */}
          <div className="ingredient-form-input">
            <div className="Price field"></div>
            <label>Price</label>
            <input
              name="price"
              type="number"
              placeholder="Price per unit"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              step="0.50"
            />
          </div>
          {/* Suppliers */}
          <div className="ingredient-form-input">
            <div className="Suppliers field"></div>
            <label>Suppliers</label>
            <input
              name="suppliers"
              placeholder="Suppliers (comma-separated)"
              value={suppliers}
              onChange={(e) => setSuppliers(e.target.value)}
            />
          </div>
        </form>
        <div className="ingredient-form-buttons">
          <button
            type="button"
            className="ingredient-form-button cancel"
            onClick={onClose}
          >
            <div className="button-text">Cancel</div>
          </button>
          <button
            type="submit"
            className={`ingredient-form-button done ${
              isSubmitting ? "submitting" : ""
            }`}
            disabled={isSubmitting}
            onClick={handleSubmit}
          >
            <div className="button-text">
              {isSubmitting
                ? "Saving..."
                : mode === "edit"
                ? "Save Changes"
                : "Add"}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
