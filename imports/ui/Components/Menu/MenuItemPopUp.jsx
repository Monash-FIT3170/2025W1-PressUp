import React, { useState, useEffect } from 'react';
import './MenuItemPopUp.css';
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Meteor } from 'meteor/meteor';
import { ConfirmPopup } from './ConfirmPopup.jsx';
import '/imports/api/menu/menu-methods.js';
import '/imports/api/menu-categories/menu-categories-methods.js';
import { InventoryCollection } from "../../../api/inventory/inventory-collection.js";

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const MenuItemPopUp = ({ onClose, addMenuItem, mode = 'create', existingItem = {}, onUpdate }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [menuCategory, setMenuCategory] = useState('');
  const [menuCategories, setMenuCategories] = useState([]);
  const [available, setAvailable] = useState(true);
  const [ingredients, setIngredients] = useState([]);
  const [ingredientAmounts, setIngredientAmounts] = useState({});
  const [seasonal, setSeasonal] = useState(false);
  const [seasons, setSeasons] = useState([]);
  const [isHalal, setIsHalal] = useState(false);
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isGlutenFree, setIsGlutenFree] = useState(false);
  const [schedule, setSchedule] = useState(
    daysOfWeek.reduce((acc, day) => {
      acc[day] = { available: false, start: '', end: '' };
      return acc;
    }, {})
  );
  const [errors, setErrors] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);

  const searchTerm = "";
  useSubscribe("inventory.nameIncludes", searchTerm);
  const findIngredients = useFind(() => InventoryCollection.find(), [searchTerm]);

  // Load menu categories
  useEffect(() => {
    (async () => {
      try {
        const result = await Meteor.callAsync("menuCategories.getCategories");
        setMenuCategories(result);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    })();
  }, []);

  // Populate existing item data when updating
  useEffect(() => {
    if (mode === 'update' && existingItem) {
      setName(existingItem.name || '');
      setPrice(existingItem.price || '');
      setMenuCategory(existingItem.menuCategory || '');
      setAvailable(existingItem.available ?? true);
      setIsHalal(existingItem.isHalal || false);
      setIsVegetarian(existingItem.isVegetarian || false);
      setIsGlutenFree(existingItem.isGlutenFree || false);

      if (existingItem.seasons?.length > 0) {
        setSeasonal(true);
        setSeasons(existingItem.seasons);
      }

      setIngredients((existingItem.ingredients || []).map(i => i.id));
      setIngredientAmounts((existingItem.ingredients || []).reduce((acc, i) => {
        acc[i.id] = i.amount;
        return acc;
      }, {}));

      if (existingItem.schedule) {
        setSchedule(prev => ({ ...prev, ...existingItem.schedule }));
      }
    }
  }, [existingItem, mode]);

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) newErrors.name = 'Item name is required';
    if (!price || isNaN(price) || parseFloat(price) <= 0) newErrors.price = 'Please enter a valid price greater than 0';
    if (!menuCategory.trim()) newErrors.menuCategory = 'Menu category is required';

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      newErrors.ingredients = 'Please select at least one ingredient';
    }
    ingredients.forEach(id => {
      const amount = parseFloat(ingredientAmounts[id]);
      if (isNaN(amount) || amount <= 0) {
        newErrors.ingredients = 'Each selected ingredient must have a valid amount';
      }
    });

    // Schedule validation: end time must be after start time
    daysOfWeek.forEach(day => {
      const { available, start, end } = schedule[day];
      if (available) {
        if (!start || !end) {
          newErrors.schedule = 'Please provide both start and end times for all available days';
        } else {
          const startTime = new Date(`1970-01-01T${start}`);
          const endTime = new Date(`1970-01-01T${end}`);
          if (endTime <= startTime) {
            newErrors.schedule = 'End time must be after the start time for each available day';
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (validateForm()) setShowConfirm(true);
  };

  const handleConfirm = e => {
    e.preventDefault();

    const itemData = {
      name,
      price: parseFloat(price),
      menuCategory,
      available,
      isHalal,
      isVegetarian,
      isGlutenFree,
      ingredients: ingredients.map(id => ({ id, amount: parseFloat(ingredientAmounts[id]) || 0 })),
      schedule,
      seasons: seasonal ? seasons : []
    };

    const callback = (error, result) => {
      if (error) {
        alert('Operation failed: ' + error.reason);
      } else {
        if (mode === 'create') {
          setName('');
          setPrice('');
          setMenuCategory('');
          setIngredients([]);
        }
        onUpdate?.(existingItem._id, itemData);
        onClose();
      }
      setShowConfirm(false);
      window.location.reload();
    };

    if (mode === 'create') {
      Meteor.call('menu.insert', itemData, callback);
    } else {
      Meteor.call('menu.update', existingItem._id, itemData, callback);
    }
  };

  const handleCancel = () => setShowConfirm(false);

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="action-button" onClick={onClose}>X</button>
        <h2>{mode === 'update' ? 'Update Menu Item' : 'Add New Menu Item'}</h2>

        <form onSubmit={handleSubmit}>
          <div>
            <label>Item Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          <div>
            <label>Price</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} />
            {errors.price && <span className="error">{errors.price}</span>}
          </div>

          <div>
            <label>Menu Category</label>
            <select value={menuCategory} onChange={e => setMenuCategory(e.target.value)}>
              <option value="">-- Select a category --</option>
              {menuCategories.map(cat => <option key={cat._id} value={cat._id}>{cat.category}</option>)}
            </select>
            {errors.menuCategory && <span className="error">{errors.menuCategory}</span>}
          </div>

          <div className="checkbox-row">
            <label><input type="checkbox" checked={available} onChange={e => setAvailable(e.target.checked)} /> Available</label>
            <label><input type="checkbox" checked={isVegetarian} onChange={e => setIsVegetarian(e.target.checked)} /> Vegetarian</label>
            <label><input type="checkbox" checked={isHalal} onChange={e => setIsHalal(e.target.checked)} /> Halal</label>
            <label><input type="checkbox" checked={isGlutenFree} onChange={e => setIsGlutenFree(e.target.checked)} /> Gluten Free</label>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            {findIngredients.map(ing => (
              <div key={ing._id} style={{ display: 'flex', gap: '10px' }}>
                <label style={{ display: 'flex', gap: '5px' }}>
                  <input
                    type="checkbox"
                    value={ing._id}
                    checked={ingredients.includes(ing._id)}
                    onChange={e => {
                      const checked = e.target.checked;
                      const newIngredients = checked
                        ? [...ingredients, ing._id]
                        : ingredients.filter(id => id !== ing._id);
                      if (!checked) {
                        const updatedAmounts = { ...ingredientAmounts };
                        delete updatedAmounts[ing._id];
                        setIngredientAmounts(updatedAmounts);
                      }
                      setIngredients(newIngredients);
                    }}
                  />
                  {ing.name}
                </label>
                {ingredients.includes(ing._id) && (
                  <input
                    type="number"
                    placeholder={`Insert amount in ${ing.units}`}
                    step="any"
                    min={0}
                    value={ingredientAmounts[ing._id] || ''}
                    onChange={e => setIngredientAmounts({ ...ingredientAmounts, [ing._id]: e.target.value })}
                  />
                )}
              </div>
            ))}
            {errors.ingredients && <span className="error">{errors.ingredients}</span>}
          </div>

          <div className="schedule-section">
            <h4>Availability Schedule</h4>
            {daysOfWeek.map(day => (
              <div key={day} className="schedule-row">
                <label>
                  <input
                    type="checkbox"
                    checked={schedule[day].available}
                    onChange={e => setSchedule({ ...schedule, [day]: { ...schedule[day], available: e.target.checked } })}
                  />
                  {day}
                </label>
                {schedule[day].available && (
                  <>
                    <input
                      type="time"
                      value={schedule[day].start}
                      onChange={e => setSchedule({ ...schedule, [day]: { ...schedule[day], start: e.target.value } })}
                    />
                    <input
                      type="time"
                      value={schedule[day].end}
                      onChange={e => setSchedule({ ...schedule, [day]: { ...schedule[day], end: e.target.value } })}
                    />
                  </>
                )}
              </div>
            ))}
            {errors.schedule && <span className="error">{errors.schedule}</span>}
          </div>

          <h4>Seasonal Availability</h4>
          <label className="schedule-row">
            <input type="checkbox" checked={seasonal} onChange={e => setSeasonal(e.target.checked)} /> Seasonal Item
          </label>
          {seasonal && ['Summer', 'Autumn', 'Winter', 'Spring'].map(season => (
            <label key={season} className="schedule-row">
              <input
                type="checkbox"
                value={season}
                checked={seasons.includes(season)}
                onChange={e => {
                  const checked = e.target.checked;
                  const newSeasons = checked
                    ? [...seasons, season]
                    : seasons.filter(s => s !== season);
                  setSeasons(newSeasons);
                }}
              />
              {season}
            </label>
          ))}

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
