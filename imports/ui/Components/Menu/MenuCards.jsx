import React from 'react';
import { Card } from './Card.jsx';

export const MenuCards = ({ menuItems, selectedCategory }) => {
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
            />
          ))
      )}
    </div>
  );
};