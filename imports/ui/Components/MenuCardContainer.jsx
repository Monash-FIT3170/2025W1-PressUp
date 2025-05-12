// Components/MenuCardContainer.jsx
import React, { useState } from "react";
import { MenuCard } from "./MenuCard.jsx";

export const MenuCardContainer = ({ menuItems, selectedCategory, onItemAdd }) => {
  const filteredItems = menuItems.filter(
    (item) =>
      selectedCategory === "All" || item.menuCategory === selectedCategory
  );

  return (
    <div className="card-container">
      {filteredItems.length === 0 ? (
        <p>No menu items available.</p>
      ) : (
        filteredItems.map((item) => (
          <MenuCard
            key={item.name}
            title={item.name}
            description={`Price: $${item.price}`}
            onButtonClick={() => onItemAdd(item)} // Pass the selected item to the parent component
          />
        ))
      )}
    </div>
  );
};

