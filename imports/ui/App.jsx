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
import { POSMenuControls } from './Components/POS/POSMenuControls.jsx';
import { POSMenuCards } from './Components/POS/POSMenuCards.jsx';
import TableMap from "./Components/Tables/TableMap.jsx";

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
  const [viewMode, setViewMode] = useState("Ingredients");

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
                    searchBar={<IngredientSearchBar onSearch={handleSearch} />}
                  />
                  <POSMenuControls
                  showPopup={showPopup}
                  setShowPopup={setShowPopup}
                  // addMenuItem={addMenuItem}
                  // categories={categories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  />
                  <POSMenuCards
                    menuItems={menuItems}
                    selectedCategory={selectedCategory}
                    updateMenuItem={updateMenuItem}
                    setMenuItems={setMenuItems}
                  />
                </>
              }
            />
            <Route
              path="/inventory"
              element={
                <>
                  <PageHeader
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    searchBar={<IngredientSearchBar onSearch={handleSearch} />}
                  />

                  <div className="view-mode-container">
                    <div className="view-mode-dropdown">
                      <img
                        src={viewMode === "Ingredients" ? "/images/Wheat.png" : "/images/Supplier.png"}
                        alt={viewMode}
                        className="view-icon"
                      />
                      <select
                        value={viewMode}
                        onChange={(e) => setViewMode(e.target.value)}
                      >
                        <option value="Ingredients">Ingredients</option>
                        <option value="Suppliers">Suppliers</option>
                      </select>
                    </div>
                  </div>

                  {viewMode === "Ingredients" ? (
                    <IngredientTable
                    searchTerm={searchTerm}
                    openOverlay={openOverlay}
                    setOpenOverlay={setOpenOverlay}
                    overlayRef={overlayRef}
                  />) :(
                    <SupplierTable
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
            <Route
              path="/tables"
              element={
                <>
                  <PageHeader
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                  />
                  <TableMap />
                </>
              }
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};
