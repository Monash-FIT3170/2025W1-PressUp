import React, { useState } from 'react';
import { Card } from './Card.jsx';
import { MenuItemPopUp } from './MenuItemPopUp.jsx';
import { Meteor } from 'meteor/meteor';
import "/imports/api/menu/menu-methods.js"; // Ensure this is imported to use Meteor methods

export const MenuCards = ({ menuItems, selectedCategory, updateMenuItem, setMenuItems }) => {
  const [existingItem, setExistingItem] = useState(false);


  const handleEditClick = (item) => {
    setExistingItem(item)
  }

  const deleteMenuItem = (itemId) => {
    Meteor.call('menu.remove', itemId, (error) => {
      if (error) {
        console.error('Error deleting menu item:', error);
      } else {
        setMenuItems((prevItems) => prevItems.filter(item => item._id !== itemId));
      }
    });
  };

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
              onButtonClick={() => handleEditClick(item)}
              onDelete={() => deleteMenuItem(item._id)}
              onEdit={() => handleEditClick(item)}
            />
          ))
      )}
    </div>
  );
};