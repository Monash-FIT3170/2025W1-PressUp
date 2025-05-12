import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "./Components/Sidebar.jsx";
import { IngredientSearchBar } from "./Components/IngredientTable/ingredientSearchBar.jsx";
import { IngredientTable } from "./Components/IngredientTable/IngredientTable.jsx";
import { SupplierTable } from "./Components/SupplierTable/SupplierTable.jsx";
import { MenuItemCreation } from "./Components/MenuItemCreation.jsx";
import { MenuCardContainer } from "./Components/MenuCardContainer.jsx";
import { PageHeader } from "./Components/PageHeader/PageHeader.jsx";
import { CheckoutSidebar } from "./Components/CheckoutSidebar.jsx"; // Import CheckoutSidebar
import "./AppStyle.css";

export const App = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);  // Left sidebar state
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false); // Right sidebar state
  const [openOverlay, setOpenOverlay] = useState(null);
  const overlayRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuppliersView, setShowSuppliersView] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]); // State for selected items

  useEffect(() => {
    Meteor.call("menu.getAll", (error, result) => {
      if (error) {
        console.error("Error fetching menu items:", error);
      } else {
        setMenuItems(result);

        const uniqueCategories = [
          ...new Set(
            result
              .map((item) => item.menuCategory)
              .filter((category) => category && category.trim() !== "")
          ),
        ];
        setCategories(["All", ...uniqueCategories]);
      }
    });
  }, []);

  const addMenuItem = (newMenuItem) => {
    setMenuItems((prevItems) => {
      const updatedItems = [...prevItems, newMenuItem];

      const uniqueCategories = [
        ...new Set(
          updatedItems
            .map((item) => item.menuCategory)
            .filter((category) => category && category.trim() !== "")
        ),
      ];
      setCategories(["All", ...uniqueCategories]);

      return updatedItems;
    });
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleAddItemToCart = (item) => {
    setSelectedItems((prevItems) => {
      const updatedItems = [...prevItems, item];
      // Only open the right sidebar if it's the first item
      if (updatedItems.length === 1) {
        setIsRightSidebarOpen(true); // Open the right sidebar if first item added
      }
      return updatedItems;
    });
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Left Sidebar */}
        <Sidebar
          isOpen={isLeftSidebarOpen}
          setIsOpen={setIsLeftSidebarOpen}
          position="left"
        />
        
        {/* Main Content */}
        <div
          className={`main-content ${
            isLeftSidebarOpen ? "content-shifted-left" : ""
          } ${isRightSidebarOpen ? "content-shifted-right" : ""}`}
        >
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <PageHeader
                    isSidebarOpen={isLeftSidebarOpen}
                    setIsSidebarOpen={setIsLeftSidebarOpen}
                  />
                </>
              }
            />
            <Route
              path="/inventory"
              element={
                <>
                  <PageHeader
                    isSidebarOpen={isLeftSidebarOpen}
                    setIsSidebarOpen={setIsLeftSidebarOpen}
                    searchBar={<IngredientSearchBar onSearch={handleSearch} />}
                  />
                  <button
                    className="toggle-view-btn"
                    onClick={() => setShowSuppliersView((v) => !v)}
                  >
                    {showSuppliersView
                      ? "← Back to Ingredients"
                      : "View Suppliers →"}
                  </button>

                  {showSuppliersView ? (
                    <SupplierTable
                      searchTerm={searchTerm}
                      openOverlay={openOverlay}
                      setOpenOverlay={setOpenOverlay}
                      overlayRef={overlayRef}
                    />
                  ) : (
                    <IngredientTable
                      searchTerm={searchTerm}
                      openOverlay={openOverlay}
                      setOpenOverlay={setOpenOverlay}
                      overlayRef={overlayRef}
                    />
                  )}
                </>
              }
            />
            <Route
              path="/menu"
              element={
                <>
                  <PageHeader
                    isSidebarOpen={isLeftSidebarOpen}
                    setIsSidebarOpen={setIsLeftSidebarOpen}
                  />
                  <button onClick={() => setShowPopup(true)}>
                    Create Menu Item
                  </button>
                  {showPopup && (
                    <MenuItemCreation
                      onClose={() => setShowPopup(false)}
                      addMenuItem={addMenuItem}
                    />
                  )}

                  <div className="filter-bar">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`filter-bubble ${
                          selectedCategory === category ? "active" : ""
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>

                  <MenuCardContainer
                    menuItems={menuItems}
                    selectedCategory={selectedCategory}
                    onItemAdd={handleAddItemToCart} // Pass addItem function
                  />
                </>
              }
            />
          </Routes>
        </div>

        {/* Right Sidebar (Checkout Sidebar) */}
        {selectedItems.length > 0 && (
          <CheckoutSidebar
            items={selectedItems}
            isOpen={isRightSidebarOpen}
            toggleSidebar={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
          />
        )}
      </div>
    </BrowserRouter>
  );
};
