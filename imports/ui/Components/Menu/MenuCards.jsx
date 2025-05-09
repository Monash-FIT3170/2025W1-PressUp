import React, { useState } from 'react';
import { Card } from './Card.jsx';
import { MenuItemPopUp } from './MenuItemPopUp.jsx';

export const MenuCards = ({ menuItems, selectedCategory, updateMenuItem }) => {
  const [existingItem, setExistingItem] = useState(false);
  
  const handleEditClick = (item) => {
    setExistingItem(item)
  }
  
  return (
    <div className="card-container">
      {existingItem && (
        <MenuItemPopUp
          mode='update'
          existingItem={existingItem}
          onClose={() => setExistingItem(false)}
          addMenuItem={updateMenuItem}
        />
      )}
      {menuItems.length === 0 ? (
        <p>No menu items available.</p>
      ) : (
        menuItems
          .filter(item => selectedCategory === 'All' || item.menuCategory === selectedCategory)
          .map(item => (
            <Card
              key={item._id}
              title={item.name}
              description={`Price: $${item.price}`}
              onEdit={() => handleEditClick(item)}
            />
          ))
      )}
    </div>
  );
};