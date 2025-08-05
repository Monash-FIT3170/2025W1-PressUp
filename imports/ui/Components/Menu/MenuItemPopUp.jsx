import React, { useState, useEffect } from 'react';
import './MenuItemPopUp.css';
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Meteor } from 'meteor/meteor';
import { ConfirmPopup } from './ConfirmPopup.jsx';
import '/imports/api/menu/menu-methods.js'; // Ensure this is imported to use Meteor methods
import '/imports/api/menu-categories/menu-categories-methods.js';
import { InventoryCollection } from "../../../api/inventory/inventory-collection.js";

const MenuItemPopUp = ({ onClose, addMenuItem, mode = 'create', existingItem = {}, onUpdate }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [menuCategory, setMenuCategory] = useState('');
  const [menuCategories, setMenuCategories] = useState([]);   // this is for the categories table
  const [available, setAvailable] = useState(true);
  const [ingredients, setIngredients] = useState('');
  const [isHalal, setIsHalal] = useState(false);
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isGlutenFree, setIsGlutenFree] = useState(false);
  const [errors, setErrors] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const searchTerm = "";
  const isInventoryReady  = useSubscribe("inventory.nameIncludes", searchTerm);
  const findIngredients = useFind(() => InventoryCollection.find(), [searchTerm]);
  // const findIngredients = useFind(() => InventoryCollection.find({}));
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [schedule, setSchedule] = useState(
    daysOfWeek.reduce((acc, day) => {
      acc[day] = { available: false, start: '', end: '' };
      return acc;
    }, {})
  );

  useEffect(() => {

    Meteor.call('menuCategories.getCategories', (error, result) => {
    if (error) {
      console.error('Failed to fetch categories:', error);
    } else {
      // console.log('Fetched categories:', result);
      setMenuCategories(result); // assuming result is an array of category strings
    }
  });


    if (mode === 'update' && existingItem) {
      setName(existingItem.name || '');
      setPrice(existingItem.price || '');
      setMenuCategory(existingItem.menuCategory || '');
      setAvailable(existingItem.available ?? true);
      setIsHalal(existingItem.isHalal || false);
      setIsVegetarian(existingItem.isVegetarian || false);
      setIsGlutenFree(existingItem.isGlutenFree || false);
      setIngredients(existingItem.ingredients ? existingItem.ingredients.join(', ') : '');
      if (existingItem.schedule) {
        setSchedule(prev => ({
          ...prev,
          ...existingItem.schedule
        }));
      }
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
      isHalal,
      isVegetarian,
      isGlutenFree,
      ingredients: ingredients.split(',').map(i => i.trim()),
      schedule,
    };

    if (mode === 'create') {
      Meteor.call('menu.insert', { menuItem: itemData }, (error, result) => {
        if (error) {
          alert('Failed to add menu item: ' + error.reason);
        } else {
          // alert('Menu item added successfully!');
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
          // alert('Menu item updated successfully!');
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
    setIsHalal(false);
    setIsVegetarian(false);
    setIsGlutenFree(false);
  };
  console.log(findIngredients)  
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
            {/* <input type="text" value={menuCategory} onChange={(e) => setMenuCategory(e.target.value)} /> */}
            <select value={menuCategory} onChange={(e) => setMenuCategory(e.target.value)}>
            <option value="">-- Select a category --</option>
            {
            // console.log('menuCategories:', menuCategories)
            menuCategories.map((cat, index) => (
              // <option key={index} value={cat}>{cat}</option>
              <option key={cat._id} value={cat._id}>{cat.category}</option>
            ))
            }
          </select>
            {errors.menuCategory && <span className="error">{errors.menuCategory}</span>}
          </div>

          <div className="checkbox-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={available}
                onChange={(e) => setAvailable(e.target.checked)}
              />
              Available
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isVegetarian}
                onChange={(e) => setIsVegetarian(e.target.checked)}
              />
              Vegetarian
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isHalal}
                onChange={(e) => setIsHalal(e.target.checked)}
              />
              Halal
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isGlutenFree}
                onChange={(e) => setIsGlutenFree(e.target.checked)}
              />
              Gluten Free
            </label>
          </div>

          <div>
            <label>Ingredients</label>
            {/* <input type="text" value={menuCategory} onChange={(e) => setMenuCategory(e.target.value)} /> */}
            <select value={ingredients} onChange={(e) => setIngredients(e.target.value)}>
            <option value="">-- Select Ingredient --</option>
            {
            // console.log('menuCategories:', menuCategories)
            findIngredients.map((ing, index) => (
              // <option key={index} value={cat}>{cat}</option>
              <option key={ing._id} value={ing._id}>{ing.name}</option>
            ))
            }
          </select>
            {errors.ingredients && <span className="error">{errors.ingredients}</span>}
          </div>

          <div className="schedule-section">
            <h4>Availability Schedule</h4>
            {daysOfWeek.map((day) => (
              <div key={day} className="schedule-row">
                <label>
                  <input
                    type="checkbox"
                    checked={schedule[day].available}
                    onChange={(e) =>
                      setSchedule({
                        ...schedule,
                        [day]: {
                          ...schedule[day],
                          available: e.target.checked
                        }
                      })
                    }
                  />
                  {day}
                </label>
                {schedule[day].available && (
                  <>
                    <input
                      type="time"
                      value={schedule[day].start}
                      onChange={(e) =>
                        setSchedule({
                          ...schedule,
                          [day]: {
                            ...schedule[day],
                            start: e.target.value
                          }
                        })
                      }
                    />
                    <input
                      type="time"
                      value={schedule[day].end}
                      onChange={(e) =>
                        setSchedule({
                          ...schedule,
                          [day]: {
                            ...schedule[day],
                            end: e.target.value
                          }
                        })
                      }
                    />
                  </>
                )}
              </div>
            ))}
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
