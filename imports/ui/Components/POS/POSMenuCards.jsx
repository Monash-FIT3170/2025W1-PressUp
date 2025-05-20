import React from 'react';
import { ItemCard } from './ItemCard.jsx';
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
            <ItemCard
              key={item._id}
              name={item.name}
              price={`Price: $${item.price}`}
              ingredients = {item.ingredients}
              isGlutenFree={item.isGlutenFree}
              isHalal={item.isHalal}
              isVegetarian={item.isVegetarian}
              onAddToOrder={() => handleAddToOrder(item)}
            />
          ))
      )}
    </div>
  );
};