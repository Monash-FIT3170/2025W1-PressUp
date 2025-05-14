// imports/ui/App.jsx
import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Sidebar } from "./Components/Sidebar.jsx";
import { IngredientSearchBar } from "./Components/IngredientTable/ingredientSearchBar.jsx";
import { IngredientTable } from "./Components/IngredientTable/IngredientTable.jsx";
import { SupplierTable } from "./Components/SupplierTable/SupplierTable.jsx";
import { MenuControls } from './Components/Menu/MenuControls.jsx';
import { MenuCards } from './Components/Menu/MenuCards.jsx';
import "./AppStyle.css";
import { PageHeader } from "./Components/PageHeader/PageHeader.jsx";

export const App = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [existingItem, setExistingItem] = useState(null);
  const [openOverlay, setOpenOverlay] = useState(null);
  const overlayRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuppliersView, setShowSuppliersView] = useState(false);

  const updateMenuItem = (item) => {
    setExistingItem(item);
    setShowPopup(true);
  }

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

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  return (
    <BrowserRouter>
      <div className={`app-container ${!isSidebarOpen ? "sidebar-closed" : ""}`}>
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className="main-content">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <PageHeader
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                  />
                </>
              }
            />
            <Route
              path="/inventory"
              element={
                <>
                  {/* always show header */}
                  <PageHeader
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    searchBar={<IngredientSearchBar onSearch={handleSearch} />}
                  />

                  {/* toggle button under the header */}
                  <button
                    className="toggle-view-btn"
                    onClick={() => setShowSuppliersView((v) => !v)}
                  >
                    {showSuppliersView
                      ? "← Back to Ingredients"
                      : "View Suppliers →"}
                  </button>

                  {/* conditional view */}
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
            <Route path="/menu" element={
              <>
                <PageHeader
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
                <MenuControls
                  showPopup={showPopup}
                  setShowPopup={setShowPopup}
                  // addMenuItem={addMenuItem}
                  // categories={categories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                />
                <MenuCards
                  menuItems={menuItems}
                  selectedCategory={selectedCategory}
                  updateMenuItem={updateMenuItem}
                  setMenuItems={setMenuItems}
                />
              </>
            }
            />
            <Route
              path="/scheduling"
              element={
                <>
                  <PageHeader
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                  />
                </>
              }
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};