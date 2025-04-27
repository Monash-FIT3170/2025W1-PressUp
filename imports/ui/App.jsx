import React, { useState, useEffect, useRef } from "react";
import { Sidebar } from "./Components/Sidebar.jsx";
import { IngredientTable } from "./Components/IngredientTable/IngredientTable.jsx";

export const App = () => {
  const [openOverlay, setOpenOverlay] = useState(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (overlayRef.current && !overlayRef.current.contains(event.target)) {
        setOpenOverlay(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content" style={{ marginLeft: "80px" }}>
        <h1>Inventory</h1>
        <IngredientTable
          openOverlay={openOverlay}
          setOpenOverlay={setOpenOverlay}
          overlayRef={overlayRef}
        />
      </div>
    </div>
  );
};
