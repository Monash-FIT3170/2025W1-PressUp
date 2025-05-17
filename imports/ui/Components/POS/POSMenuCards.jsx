import React from 'react';
import { Card } from './ItemCard.jsx';
import { Meteor } from 'meteor/meteor';
import "/imports/api/menu/menu-methods.js"; // Ensure this is imported to use Meteor methods

export const POSMenuCards = ({ menuItems, selectedCategory, addToOrder }) => {
  // Function to handle adding an item to the order
  const handleAddToOrder = (item) => {
    addToOrder(item);
  };

  return (
    <div className="card-container">
      {menuItems.length === 0 ? (
        <p>No menu items available.</p>
      ) : (
        menuItems
          .filter(item => selectedCategory === 'All' || item.menuCategory === selectedCategory)
          .map(item => (
            <Card
              key={item._id}
              title={item.name}
              description={`$${item.price?.toFixed(2) || '0.00'}`}
              onAddToOrder={() => handleAddToOrder(item)}
            />
          ))
      )}
    </div>
  );
};