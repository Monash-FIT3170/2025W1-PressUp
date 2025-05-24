
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
import { OrderPanel } from './Components/POS/OrderPanel.jsx';
import "./Components/POS/OrderPanel.css";

// Import Meteor for data operations
import { Meteor } from 'meteor/meteor';

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
  
  // State for order management
  const [orderItems, setOrderItems] = useState([]);

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

  // Function to add an item to the order
  const addToOrder = (item) => {
    setOrderItems(prevItems => {
      // Check if the item is already in the order
      const existingItemIndex = prevItems.findIndex(
        orderItem => orderItem._id === item._id
      );
      
      if (existingItemIndex !== -1) {
        // Item exists, increment quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += 1;
        return updatedItems;
      } else {
        // Item doesn't exist, add it with quantity 1
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
  };

  // Function to remove an item from the order
  const removeFromOrder = (itemId) => {
    setOrderItems(prevItems => 
      prevItems.filter(item => item._id !== itemId)
    );
  };

  // Function to update the quantity of an item in the order
  const updateQuantity = (itemId, newQuantity) => {
    setOrderItems(prevItems => 
      prevItems.map(item => 
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };
  
  // Function to clear the entire order
  const clearOrder = () => {
    setOrderItems([]);
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
                <div className="pos-layout">
                  <div className="pos-content">
                    <PageHeader
                      isSidebarOpen={isSidebarOpen}
                      setIsSidebarOpen={setIsSidebarOpen}
                      searchBar={<IngredientSearchBar onSearch={handleSearch} />}
                    />
                    <POSMenuControls
                      showPopup={showPopup}
                      setShowPopup={setShowPopup}
                      selectedCategory={selectedCategory}
                      setSelectedCategory={setSelectedCategory}
                    />
                    <POSMenuCards
                      menuItems={menuItems}
                      selectedCategory={selectedCategory}
                      addToOrder={addToOrder}
                    />
                  </div>
                  <OrderPanel 
                    orderItems={orderItems}
                    removeFromOrder={removeFromOrder}
                    updateQuantity={updateQuantity}
                    clearOrder={clearOrder}
                  />
                </div>
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
                    searchBar={<IngredientSearchBar onSearch={handleSearch}/>}
                    addButton={<MenuControls
                        showPopup={showPopup}
                        setShowPopup={setShowPopup}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        compact={true} // Only render the button
                      />}
                  />
                <MenuControls
                  showPopup={showPopup}
                  setShowPopup={setShowPopup}
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