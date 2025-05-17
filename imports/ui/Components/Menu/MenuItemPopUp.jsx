import React, { useState, useEffect } from 'react';
import './MenuItemPopUp.css';
import { Meteor } from 'meteor/meteor';
import { ConfirmPopup } from './ConfirmPopup.jsx';
import '/imports/api/menu/menu-methods.js'; // Ensure this is imported to use Meteor methods

const MenuItemPopUp = ({ onClose, addMenuItem, mode = 'create', existingItem = {}, onUpdate }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [menuCategory, setMenuCategory] = useState('');
  const [available, setAvailable] = useState(true);
  const [ingredients, setIngredients] = useState('');
  const [errors, setErrors] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (mode === 'update' && existingItem) {
      setName(existingItem.name || '');
      setPrice(existingItem.price || '');
      setMenuCategory(existingItem.menuCategory || '');
      setAvailable(existingItem.available || true);
      setIngredients(existingItem.ingredients ? existingItem.ingredients.join(', ') : '');
    }
  }, [existingItem, mode]);

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Item name is required';
    if (!price || isNaN(price) || parseFloat(price) <= 0) newErrors.price = 'Please enter a valid price greater than 0';
    if (!menuCategory.trim()) newErrors.menuCategory = 'Menu category is required';
    if (ingredients && !Array.isArray(ingredients.split(','))) newErrors.ingredients = 'Ingredients must be a comma-separated list';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validateForm()) {
      setShowConfirm(true);
    }
  };

  const handleConfirm = () => {
    const itemData = {
      name,
      price: parseFloat(price),
      menuCategory,
      available,
      ingredients: ingredients.split(',').map(i => i.trim()),
    };

    if (mode === 'create') {
      Meteor.call('menu.insert', { menuItem: itemData }, (error, result) => {
        if (error) {
          alert('Failed to add menu item: ' + error.reason);
        } else {
          alert('Menu item added successfully!');
          addMenuItem(newMenuItem);
          setName('');
          setPrice('');
          setMenuCategory('');
          setIngredients('');
          onClose();  // Close the popup after successful submission
        }
      });
    } else if (mode === 'update') {
      Meteor.call('menu.update', { _id: existingItem._id, menuItem: itemData }, (error, result) => {
        if (error) {
          alert('Failed to update menu item: ' + error.reason);
        } else {
          alert('Menu item updated successfully!');
          onUpdate?.(existingItem._id, itemData);
          onClose();
        }
      });
    }

    setShowConfirm(false);
    window.location.reload(); // Reload the page to reflect changes
  };

  const handleCancel = () => setShowConfirm(false);

  const resetForm = () => {
    setName('');
    setPrice('');
    setMenuCategory('');
    setIngredients('');
    setAvailable(true);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="action-button" onClick={onClose}>X</button>
        <h2>{mode === 'update' ? 'Update Menu Item' : 'Add New Menu Item'}</h2>

        <form onSubmit={handleSubmit}>
          <div>
            <label>Item Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          <div>
            <label>Price</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
            {errors.price && <span className="error">{errors.price}</span>}
          </div>

          <div>
            <label>Menu Category</label>
            <input type="text" value={menuCategory} onChange={(e) => setMenuCategory(e.target.value)} />
            {errors.menuCategory && <span className="error">{errors.menuCategory}</span>}
          </div>

          <div>
            <label>Available</label>
            <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} />
          </div>

          <div>
            <label>Ingredients</label>
            <input type="text" value={ingredients} onChange={(e) => setIngredients(e.target.value)} />
            {errors.ingredients && <span className="error">{errors.ingredients}</span>}
          </div>

          <button type="submit">{mode === 'update' ? 'Update Menu Item' : 'Add Menu Item'}</button>
        </form>

        {showConfirm && (
          <ConfirmPopup
            message={`Are you sure you want to ${mode === 'update' ? 'update' : 'add'} this menu item?`}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export { MenuItemPopUp };
