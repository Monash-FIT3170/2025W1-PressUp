// imports/ui/App.jsx
import React, { useState, useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "./Components/Sidebar.jsx";
import { IngredientSearchBar } from "./Components/IngredientTable/ingredientSearchBar.jsx";
import { IngredientTable } from "./Components/IngredientTable/IngredientTable.jsx";
import "./AppStyle.css"; // Importing CSS for styling

export const App = () => {
  const [openOverlay, setOpenOverlay] = useState(null);
  const overlayRef = useRef(null);

  // Handle outside clicks for overlays
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (overlayRef.current && !overlayRef.current.contains(event.target)) {
        setOpenOverlay(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <h1>Home</h1>
                  <div>Welcome to the Home Page!</div>
                </>
              }
            />
            <Route
              path="/inventory"
              element={
                <>
                  <div className="page-header">
                    <div className="title-search-container">
                      <h1>Inventory</h1>
                      <IngredientSearchBar
                        onSearch={(term) => console.log("Searching:", term)}
                      />
                    </div>
                  </div>
                  <IngredientTable
                    openOverlay={openOverlay}
                    setOpenOverlay={setOpenOverlay}
                    overlayRef={overlayRef}
                  />
                </>
              }
            />
            <Route
              path="/menu"
              element={
                <>
                  <h1>Menu</h1>
                  <div>Here is the Menu Page!</div>
                </>
              }
            />
            <Route
              path="/scheduling"
              element={
                <>
                  <h1>Scheduling</h1>
                  <div>Scheduling Page Content!</div>
                </>
              }
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};
