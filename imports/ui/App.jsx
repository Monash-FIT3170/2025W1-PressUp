import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Sidebar } from "./Components/Sidebar.jsx";
import { IngredientTable } from "./Components/IngredientTable/IngredientTable.jsx";
import { SupplierTable } from "./Components/SupplierTable/SupplierTable.jsx";
import { MenuControls } from "./Components/Menu/MenuControls.jsx";
import { MenuCards } from "./Components/Menu/MenuCards.jsx";
import "./AppStyle.css";
import { PageHeader } from "./Components/PageHeader/PageHeader.jsx";
import { POSMenuControls } from "./Components/POS/POSMenuControls.jsx";
import { POSMenuCards } from "./Components/POS/POSMenuCards.jsx";
import { OrderPanel } from "./Components/POS/OrderPanel.jsx";
import "./Components/POS/OrderPanel.css";
import { MenuItemSearchBar } from "./Components/Menu/menuItemSearchBar.jsx";

// Import Meteor for data operations
import { Meteor } from "meteor/meteor";
import { InventoryViewModeDropdown } from "./Components/InventoryViewModeDropdown/InventoryViewModeDropdown.jsx";
import { SearchBar } from "./Components/PageHeader/SearchBar/SearchBar.jsx";
import { OrderSummary } from "./Components/POS/orderSummary.jsx";

export const App = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(["all"]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [existingItem, setExistingItem] = useState(null);
  const [openOverlay, setOpenOverlay] = useState(null);
  const overlayRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [menuItemSearchTerm, setMenuItemSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("Ingredients");
  const [checkout, setCheckout] = useState(false);
  const [checkoutID, setCheckoutID] = useState(null);

  // State for order management
  const [orderItems, setOrderItems] = useState([]);

  const updateMenuItem = (item) => {
    setExistingItem(item);
    setShowPopup(true);
  };

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
  }, [overlayRef]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleMenuItemSearch = (term) => {
    setMenuItemSearchTerm(term);
  };

  // Function to add an item to the order
  const addToOrder = (item) => {
    setOrderItems((prevItems) => {
      // Check if the item is already in the order
      const existingItemIndex = prevItems.findIndex(
        (orderItem) => orderItem._id === item._id
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
    setOrderItems((prevItems) =>
      prevItems.filter((item) => item._id !== itemId)
    );
  };

  // Function to update the quantity of an item in the order
  const updateQuantity = (itemId, newQuantity) => {
    setOrderItems((prevItems) =>
      prevItems.map((item) =>
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
      <div
        className={`app-container ${!isSidebarOpen ? "sidebar-closed" : ""}`}
      >
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
                      searchBar={<SearchBar onSearch={handleSearch} />}
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
                      searchTerm={searchTerm}
                    />
                  </div>
                  {checkout ? (
                    <OrderSummary
                      orderID={checkoutID}
                      setCheckout={setCheckout}
                    />
                  ) : (
                    <OrderPanel
                      orderItems={orderItems}
                      removeFromOrder={removeFromOrder}
                      updateQuantity={updateQuantity}
                      clearOrder={clearOrder}
                      setCheckout={setCheckout}
                      setCheckoutID={setCheckoutID}
                    />
                  )}
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
                    searchBar={<SearchBar onSearch={handleSearch} />}
                  />

                  <InventoryViewModeDropdown
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                  />

                  {viewMode === "Ingredients" ? (
                    <IngredientTable
                      searchTerm={searchTerm}
                      openOverlay={openOverlay}
                      setOpenOverlay={setOpenOverlay}
                      overlayRef={overlayRef}
                    />
                  ) : (
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
            <Route
              path="/menu"
              element={
                <>
                  <PageHeader
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    searchBar={
                      <MenuItemSearchBar onSearch={handleMenuItemSearch} />
                    }
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
                    searchTerm={menuItemSearchTerm}
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
