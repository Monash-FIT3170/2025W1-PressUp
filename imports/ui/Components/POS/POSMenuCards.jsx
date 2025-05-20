import React, { useState } from 'react';
import { Card } from './ItemCard.jsx';
import { Meteor } from 'meteor/meteor';
import "/imports/api/menu/menu-methods.js"; // Ensure this is imported to use Meteor methods

export const POSMenuCards = ({ menuItems, selectedCategory}) => {
  const [existingItem, setExistingItem] = useState(false);

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
              description={`Price: $${item.price}`}
              onButtonClick={() => handleEditClick(item)}
            />
          ))
      )}
    </div>
  );
};