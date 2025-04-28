import React, { useState, useEffect, useRef } from "react";
import { Sidebar } from "./Components/Sidebar.jsx";
import { IngredientTable } from "./Components/IngredientTable/IngredientTable.jsx";

export const App = () => {
  const [currentPage, setCurrentPage] = useState("inventory"); // Default page is set to "Inventory"
  const [openOverlay, setOpenOverlay] = useState(null);
  const overlayRef = useRef(null);

  // Function to change the current page
  const changePage = (page) => {
    setCurrentPage(page);
  };

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

  // App container
  return (
    <div className="app-container">
      <Sidebar changePage={changePage} currentPage={currentPage} />
      {/* Pass changePage function to Sidebar */}
      <div className="main-content" style={{ marginLeft: "80px" }}>
        {/* Page title */}
        {currentPage === "inventory" && <h1>Inventory</h1>}
        {currentPage === "home" && <h1>Home</h1>}
        {currentPage === "menu" && <h1>Menu</h1>}
        {currentPage === "scheduling" && <h1>Scheduling</h1>}

        {/* Page content for inventory */}
        {currentPage === "inventory" && (
          <IngredientTable
            openOverlay={openOverlay}
            setOpenOverlay={setOpenOverlay}
            overlayRef={overlayRef}
          />
        )}

        {/* Page content for other pages to be added below */}
        {currentPage === "home" && <div>Welcome to the Home Page!</div>}
        {currentPage === "menu" && <div>Here is the Menu Page!</div>}
        {currentPage === "scheduling" && <div>Scheduling Page Content!</div>}
      </div>
    </div>
  );
};
