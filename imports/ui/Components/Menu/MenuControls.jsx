import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { MenuCategories } from '/imports/api/menu-categories/menu-categories-collection'; // Adjust the path as needed

import { MenuItemPopUp } from './MenuItemPopUp.jsx';


export const MenuControls = ({ selectedCategory, setSelectedCategory, showPopup, setShowPopup }) => {

  const categories = useTracker(() => {
    Meteor.subscribe('menuCategories.all');
    const dbCategories = MenuCategories.find({}, { sort: { sortOrder: 1 } }).fetch();
    console.log('Fetched categories:', dbCategories);
    return ['All', ...dbCategories.map(c => c.category)];
  });

  const addMenuItem = (newMenuItem) => {
    setMenuItems((prevItems) => {
      const updatedItems = [...prevItems, newMenuItem];
  
      const uniqueCategories = [...new Set(
        updatedItems
          .map(item => item.menuCategory)
          .filter(category => category && category.trim() !== '')
      )];
      setCategories(['All', ...uniqueCategories]);
  
      return updatedItems;
    });
  };
  
  return (
    <>
      <button className="action-button" onClick={() => setShowPopup(true)}>+ New Menu Item</button>
      {showPopup && <MenuItemPopUp onClose={() => setShowPopup(false)} addMenuItem={addMenuItem} mode='create'/>}

      <div className="filter-bar">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`filter-bubble ${selectedCategory === category ? 'active' : ''}`}
          >
            {category}
          </button>
        ))}
      </div>
    </>
  );
};