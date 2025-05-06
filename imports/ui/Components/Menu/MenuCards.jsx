import React, { useState } from 'react';
import { Card } from './Card.jsx';
import { MenuItemPopUp } from './MenuItemPopUp.jsx';

export const MenuCards = ({ menuItems, selectedCategory, updateMenuItem }) => {
  const [editingItem, setEditingItem] = useState(false);

  const handleEditClick = (item) => {
    console.log('Editing item:', item);
    setEditingItem(item)
  }
  
  return (
    <div className="card-container">
      {editingItem && (
        <MenuItemPopUp
          existingData={editingItem}
          onClose={() => setEditingItem(false)}
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
              key={item.name}
              title={item.name}
              description={`Price: $${item.price}`}
              onButtonClick={() => handleEditClick(item)}
            />
          ))
      )}
    </div>
  );
};