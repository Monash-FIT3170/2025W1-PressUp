import React, { useState } from 'react';
import { MenuItemPopUp } from './MenuItemPopUp.jsx';


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




export const MenuControls = ({ categories, selectedCategory, setSelectedCategory, showPopup, setShowPopup }) => {
  return (
    <>
      <button onClick={() => setShowPopup(true)}>Create Menu Item</button>
      {showPopup && <MenuItemPopUp onClose={() => setShowPopup(false)} addMenuItem={addMenuItem} />}

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