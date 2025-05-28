import React, { useState } from "react";
import "./InventoryViewModeDropdown.css";

export const InventoryViewModeDropdown = ({ viewMode, setViewMode }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const viewModes = [
    {
      label: "Ingredients",
      icon: "/images/IngredientIcon.svg",
    },
    {
      label: "Suppliers",
      icon: "/images/SupplierIcon.svg",
    },
  ];

  const sortedViewModes = [
    viewModes.find((mode) => mode.label === viewMode),
    ...viewModes.filter((mode) => mode.label !== viewMode),
  ];

  return (
    <button
      className="view-mode-dropdown"
      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
    >
      <img
        src={sortedViewModes[0].icon}
        alt={sortedViewModes[0].label}
        className="view-icon"
      />
      {sortedViewModes[0].label}
      <img src="/images/ExpandIcon.svg" alt="Expand" className="view-icon" />

      {isDropdownOpen && (
        <div className="view-mode-dropdown-menu">
          {sortedViewModes.map((mode) => (
            <button
              key={mode.label}
              className="view-mode-dropdown-menu-item"
              onClick={() => {
                setViewMode(mode.label);
                setIsDropdownOpen(false);
              }}
            >
              <img src={mode.icon} alt={mode.label} className="view-icon" />
              {mode.label}
              {mode.label === viewMode && (
                <img
                  src="/images/ExpandIcon.svg"
                  alt="Expand"
                  className="view-icon"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </button>
  );
};
