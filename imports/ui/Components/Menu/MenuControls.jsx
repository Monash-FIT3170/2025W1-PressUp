import React, { useState } from 'react';
import { MenuItemPopUp } from './MenuItemPopUp.jsx';

export const MenuControls = ({ categories, selectedCategory, setSelectedCategory, addMenuItem }) => {
  const [showPopup, setShowPopup] = useState(false);
  
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