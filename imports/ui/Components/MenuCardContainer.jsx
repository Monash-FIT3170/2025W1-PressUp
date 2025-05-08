// Components/MenuCardContainer.jsx
import React, { useState } from "react";
import { MenuCard } from "./MenuCard.js";

export const MenuCardContainer = ({ menuItems, selectedCategory }) => {
  const [count, setCount] = useState(0);

  const handleAddClick = () => {
    setCount((prev) => prev + 1);
  };

  const filteredItems = menuItems.filter(
    (item) =>
      selectedCategory === "All" || item.menuCategory === selectedCategory
  );

  return (
    <div style={{ display: "flex" }}>
      <div className="card-container" style={{ flex: 1 }}>
        {filteredItems.length === 0 ? (
          <p>No menu items available.</p>
        ) : (
          filteredItems.map((item) => (
            <MenuCard
              key={item.name}
              title={item.name}
              description={`Price: $${item.price}`}
              onButtonClick={handleAddClick}
            />
          ))
        )}
      </div>

      {count > 0 && (
        <div className="sidebar">
          <h3>Selected Items</h3>
          <p>Total added: {count}</p>
        </div>
      )}
    </div>
  );
};
