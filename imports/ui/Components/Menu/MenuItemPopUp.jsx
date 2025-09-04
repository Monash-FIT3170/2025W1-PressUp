import React, { useState, useEffect } from 'react';
import './MenuItemPopUp.css';
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Meteor } from 'meteor/meteor';
import { ConfirmPopup } from './ConfirmPopup.jsx';
import '/imports/api/menu/menu-methods.js'; // Ensure this is imported to use Meteor methods
import '/imports/api/menu-categories/menu-categories-methods.js';
import {Menu} from '/imports/api/menu/menu-collection.js';
import { InventoryCollection } from "../../../api/inventory/inventory-collection.js";

const MenuItemPopUp = ({ onClose, addMenuItem, mode = 'create', existingItem = {}, onUpdate }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [menuCategory, setMenuCategory] = useState('');
  const [menuCategories, setMenuCategories] = useState([]);   // this is for the categories table
  const [available, setAvailable] = useState(true);
  const [ingredients, setIngredients] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [seasonal, setSeasonal] = useState(false);
  const [isHalal, setIsHalal] = useState(false);
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isGlutenFree, setIsGlutenFree] = useState(false);
  const [errors, setErrors] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const searchTerm = "";
  const isInventoryReady  = useSubscribe("inventory.nameIncludes", searchTerm);
  const findIngredients = useFind(() => InventoryCollection.find(), [searchTerm]);
  const [ingredientAmounts, setIngredientAmounts] = useState({});

  
  // const findIngredients = useFind(() => InventoryCollection.find({}));
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [schedule, setSchedule] = useState(
    daysOfWeek.reduce((acc, day) => {
      acc[day] = { available: false, start: '', end: '' };
      return acc;
    }, {})
  );
  useEffect(() => {

  //   Meteor.call('menuCategories.getCategories', (error, result) => {
  //   if (error) {
  //     console.error('Failed to fetch categories:', error);
  //   } else {
  //     // console.log('Fetched categories:', result);
  //     setMenuCategories(result); // assuming result is an array of category strings
  //   }
  // });
  (async () => {
    try {
      const result = await Meteor.callAsync("menuCategories.getCategories");
      setMenuCategories(result);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  })();


    if (mode === 'update' && existingItem) {
      setName(existingItem.name || '');
      setPrice(existingItem.price || '');
      setMenuCategory(existingItem.menuCategory || '');
      setAvailable(existingItem.available ?? true);
      setIsHalal(existingItem.isHalal || false);
      setIsVegetarian(existingItem.isVegetarian || false);
      setIsGlutenFree(existingItem.isGlutenFree || false);
      // setIngredients(existingItem.ingredients || []);
      if (existingItem.seasons && existingItem.seasons.length > 0) {
        setSeasonal(true)
        setSeasons(existingItem.seasons)
      }
      setIngredients((existingItem.ingredients || []).map(ing => ing.id));
      setIngredientAmounts((existingItem.ingredients || []).reduce((acc, ing) => {
          acc[ing.id] = ing.amount;
          return acc;
        }, {}));

        if (existingItem.schedule) {
          setSchedule(prev => ({
            ...prev,
            ...existingItem.schedule
          }));
        }
      }
  }, [existingItem, mode]);

  useEffect(() => {
    (async () => {
      try {
        const docs = await Meteor.callAsync('menu.getAll');
        console.log('[MenuItemPopUp] Menu docs:', docs);
      } catch (e) {
        console.error('Failed to load menu:', e);
      }
    })();
  }, []);
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
    var itemData;
    if (seasonal && seasons.length > 0 && seasons.length < 4) {
        itemData = {
          name,
          price: parseFloat(price),
          menuCategory,
          available,
          isHalal,
          isVegetarian,
          isGlutenFree,
          // ingredients,
          ingredients: ingredients.map(id => ({
            id,
            amount: parseFloat(ingredientAmounts[id]) || 0
          })),
          schedule,
          seasons,
        };
    } else {
      itemData = {
        name,
        price: parseFloat(price),
        menuCategory,
        available,
        isHalal,
        isVegetarian,
        isGlutenFree,
        // ingredients,
        ingredients: ingredients.map(id => ({
          id,
          amount: parseFloat(ingredientAmounts[id]) || 0
        })),
        schedule,
        'seasons':[],
      };
    }

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
          setIngredients([]);
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            {findIngredients.map((ing) => (
              <div key={ing._id} style={{ display: 'flex', gap: '10px' }}>
                <label style={{ display: 'flex', gap: '5px' }}>
                  <input
                    type="checkbox"
                    value={ing._id}
                    checked={ingredients.includes(ing._id)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      const newIngredients = checked
                        ? [...ingredients, ing._id]
                        : ingredients.filter(id => id !== ing._id);

                      // Clean up amount if unchecked
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

                {/* Show input for amount if checked */}
                {ingredients.includes(ing._id) && (
                  <input
                    type="number"
                    placeholder="Amount (e.g. 100g)"
                    value={ingredientAmounts[ing._id] || ''}
                    min = {0}
                    onChange={(e) =>
                      setIngredientAmounts({
                        ...ingredientAmounts,
                        [ing._id]: e.target.value
                      })
                    }
                    onBlur={(e) => {
                      if (e.target.value && e.target.value <= 0) {
                        e.target.value = null;
                        setIngredientAmounts({
                          ...ingredientAmounts,
                          [ing._id]: e.target.value
                        })
                      }
                    }}
                  />
                )}
              </div>
            ))}

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
            <h4>Seasonal Availability</h4>
            <div className="schedule-row">
            <label>
            <input 
              type='checkbox'
              checked = {seasonal}
              onChange={(e)=>{
                setSeasonal(e.target.checked)
              }}
            />
            Seasonal Item
            </label>
            </div>
            {seasonal && (<><h5>Available In:</h5><label className="schedule-row">
                  <input
                    type="checkbox"
                    value='Summer'
                    checked={seasons.includes('Summer')}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      const newSeasons = checked
                        ? [...seasons, 'Summer']
                        : seasons.filter(season => season !== 'Summer');


                      setSeasons(newSeasons);
                    }}
                  />
                  Summer
                </label>
                <label className="schedule-row">
                  <input
                    type="checkbox"
                    value='Autumn'
                    checked={seasons.includes('Autumn')}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      const newSeasons = checked
                        ? [...seasons, 'Autumn']
                        : seasons.filter(season => season !== 'Autumn');


                      setSeasons(newSeasons);
                    }}
                  />
                  Autumn
                </label>
                <label className="schedule-row">
                  <input
                    type="checkbox"
                    value='Winter'
                    checked={seasons.includes('Winter')}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      const newSeasons = checked
                        ? [...seasons, 'Winter']
                        : seasons.filter(season => season !== 'Winter');


                      setSeasons(newSeasons);
                    }}
                  />
                  Winter
                </label>
                <label className="schedule-row">
                  <input
                    type="checkbox"
                    value='Summer'
                    checked={seasons.includes('Spring')}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      const newSeasons = checked
                        ? [...seasons, 'Spring']
                        : seasons.filter(season => season !== 'Spring');


                      setSeasons(newSeasons);
                    }}
                  />
                  Spring
                </label>
              
                </>)}
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
