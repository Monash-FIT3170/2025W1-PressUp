import React, { useState } from 'react';
import './MenuItemPopUp.css'; // for styling
import { Meteor } from 'meteor/meteor';

const MenuItemPopUp = ({ onClose }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [menuCategory, setMenuCategory] = useState('');
  const [available, setAvailable] = useState(true);
  const [ingredients, setIngredients] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = 'Item name is required';
    }
    if (!price || isNaN(price) || parseFloat(price) <= 0) {
      newErrors.price = 'Please enter a valid price greater than 0';
    }
    if (!menuCategory.trim()) {
      newErrors.menuCategory = 'Menu category is required';
    }
    if (ingredients && !Array.isArray(ingredients.split(','))) {
      newErrors.ingredients = 'Ingredients must be a comma-separated list';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validateForm()) {
      const newMenuItem = {
        name,
        price: parseFloat(price),
        menuCategory,
        available,
        ingredients: ingredients.split(',').map((ingredient) => ingredient.trim()),
      };
    };

    Meteor.call('menu.insert', { menuItem: newMenuItem }, (error, result) => {
      if (error) {
        alert('Failed to add menu item: ' + error.reason);
      } else {
        alert('Menu item added successfully!');
        setName('');
        setPrice('');
        setMenuCategory('');
        setIngredients('');
        onClose();  // Close the popup after successful submission
      }
    });
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="close-button" onClick={onClose}>X</button>
        <h2>Add New Menu Item</h2>
        
        <form onSubmit={handleSubmit}>
          <div>
            <label>Item Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          <div>
            <label>Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            {errors.price && <span className="error">{errors.price}</span>}
          </div>

          <div>
            <label>Menu Category</label>
            <input
              type="text"
              value={menuCategory}
              onChange={(e) => setMenuCategory(e.target.value)}
            />
            {errors.menuCategory && <span className="error">{errors.menuCategory}</span>}
          </div>

          <div>
            <label>Available</label>
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => setAvailable(e.target.checked)}
            />
          </div>

          <div>
            <label>Ingredients</label>
            <input
              type="text"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
            />
            {errors.ingredients && <span className="error">{errors.ingredients}</span>}
          </div>

          <button type="submit">Add Menu Item</button>
        </form>
      </div>
    </div>
  );
};

export { MenuItemPopUp };
