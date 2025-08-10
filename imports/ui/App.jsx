import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, useNavigate, Navigate, useLocation } from "react-router-dom";
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from "meteor/meteor";

// Components
import { Sidebar } from "./Components/Sidebar.jsx";
import { IngredientTable } from "./Components/IngredientTable/IngredientTable.jsx";
import { SupplierTable } from "./Components/SupplierTable/SupplierTable.jsx";
import { MenuControls } from "./Components/Menu/MenuControls.jsx";
import { MenuCards } from "./Components/Menu/MenuCards.jsx";
import { PageHeader } from "./Components/PageHeader/PageHeader.jsx";
import { POSMenuControls } from "./Components/POS/POSMenuControls.jsx";
import { POSMenuCards } from "./Components/POS/POSMenuCards.jsx";
import { OrderPanel } from "./Components/POS/OrderPanel.jsx";
import { MenuItemSearchBar } from "./Components/Menu/menuItemSearchBar.jsx";
import { InventoryViewModeDropdown } from "./Components/InventoryViewModeDropdown/InventoryViewModeDropdown.jsx";
import { SearchBar } from "./Components/PageHeader/SearchBar/SearchBar.jsx";
import { OrderSummary } from "./Components/POS/orderSummary.jsx";
import { Login } from "./Components/Login/Login.jsx";
import TableMap from "./Components/Tables/TableMap.jsx";
import { PreLoginPage } from "./Components/PreLogin/PreLoginPage.jsx"; // New component
import { LoyaltySignupPage } from "./Components/PreLogin/LoyaltySignupPage.jsx"; // New component
import { Enquiries } from "./Components/Enquiries/Enquiries.jsx";
import { PromotionPage } from './Components/Promotion/PromotionPage.jsx';

// Styles
import "./AppStyle.css";
import "./Components/POS/OrderPanel.css";


// Component to handle route protection and redirection logic
const RouteHandler = ({ children }) => {
  const location = useLocation();
  const { user, isLoading } = useTracker(() => {
    const subscription = Meteor.subscribe('currentUser');
    const user = Meteor.user();

    if (user) {
      // console.log('=== USER DEBUG ===');
      // console.log('Full user object:', user);
      // console.log('Username:', user.username);
      // console.log('isAdmin value:', user.isAdmin);
      // console.log('Type of isAdmin:', typeof user.isAdmin);
      // console.log('Has isAdmin property?:', user.hasOwnProperty('isAdmin'));
      // console.log('=================');
    }
    
    return {
      user,
      isLoading: !subscription.ready() || Meteor.loggingIn()
    };
  });

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // If no user and trying to access root path, show pre-login page
  if (!user && location.pathname === '/') {
    return <PreLoginPage />;
  }

  if (user && location.pathname === '/') {
    return <Navigate to="/pos" replace />;
  }

  // If no user and trying to access any other protected route, redirect to pre-login
  if (!user && location.pathname !== '/login' && location.pathname !== '/pre-login' && location.pathname !== '/loyalty-signup' && location.pathname !== '/enquiries') {
    return <Navigate to="/" replace />;
  }

  // If user exists and trying to access login or pre-login, redirect to POS
  if (user && (location.pathname === '/login' || location.pathname === '/pre-login')) {
    return <Navigate to="/pos" replace />;
  }

  return children;
};

export const App = () => {
  // Existing state
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

  const { user } = useTracker(() => ({
    user: Meteor.user()
  }));

  const updateMenuItem = (item) => {
    setExistingItem(item);
    setShowPopup(true);
  };

  useEffect(() => {
    // Only fetch menu items if user is logged in
    if (user) {
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
    }
  }, [user]);

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

  // Main app with routing
  return (
    <BrowserRouter>
      <RouteHandler>
        <Routes>
          {/* Login route */}
          <Route 
            path="/login" 
            element={<Login />} 
          />
          
          {/* Pre-login route (optional explicit route) */}
          <Route 
            path="/pre-login" 
            element={<PreLoginPage />} 
          />
          
          {/* Loyalty signup route */}
          <Route 
            path="/loyalty-signup" 
            element={<LoyaltySignupPage />} 
          />

          {/* Customer Enquiries route */}
          <Route
            path="/enquiries"
            element={<Enquiries />}
          />
          
          {/* Root route - handled by RouteHandler */}
          <Route
            path="/"
            element={<PreLoginPage />}
          />
          
          {/* Protected POS route */}
          <Route
            path="/pos"
            element={
              <div className={`app-container ${!isSidebarOpen ? "sidebar-closed" : ""}`}>
                <Sidebar 
                  isOpen={isSidebarOpen} 
                  setIsOpen={setIsSidebarOpen}
                  isAdmin={user?.isAdmin} 
                />
                <div className="main-content">
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
                </div>
              </div>
            }
          />
          
          {/* Other protected routes */}
          <Route
            path="/inventory"
            element={
              user?.isAdmin ? (
                <div className={`app-container ${!isSidebarOpen ? "sidebar-closed" : ""}`}>
                  <Sidebar 
                    isOpen={isSidebarOpen} 
                    setIsOpen={setIsSidebarOpen}
                    isAdmin={user.isAdmin} 
                  />
                  <div className="main-content">
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
                  </div>
                </div>
              ) : (
                <Navigate to="/pos" replace />
              )
            }
          />
          
          <Route
            path="/menu"
            element={
              <div className={`app-container ${!isSidebarOpen ? "sidebar-closed" : ""}`}>
                <Sidebar 
                  isOpen={isSidebarOpen} 
                  setIsOpen={setIsSidebarOpen}
                  isAdmin={user?.isAdmin} 
                />
                <div className="main-content">
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
                </div>
              </div>
            }
          />
          
          <Route
            path="/scheduling"
            element={
              <div className={`app-container ${!isSidebarOpen ? "sidebar-closed" : ""}`}>
                <Sidebar 
                  isOpen={isSidebarOpen} 
                  setIsOpen={setIsSidebarOpen}
                  isAdmin={user?.isAdmin} 
                />
                <div className="main-content">
                  <PageHeader
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                  />
                </div>
              </div>
            }
          />
          
          <Route
            path="/promotions"
            element={
              <div className={`app-container ${!isSidebarOpen ? "sidebar-closed" : ""}`}>
                <Sidebar 
                  isOpen={isSidebarOpen} 
                  setIsOpen={setIsSidebarOpen}
                  isAdmin={user?.isAdmin} 
                />
                <div className="main-content">
                  <PageHeader
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                  />
                  <PromotionPage />
                </div>
              </div>
            }
          />
          
          <Route
            path="/tables"
            element={
              <div className={`app-container ${!isSidebarOpen ? "sidebar-closed" : ""}`}>
                <Sidebar 
                  isOpen={isSidebarOpen} 
                  setIsOpen={setIsSidebarOpen}
                  isAdmin={user?.isAdmin} 
                />
                <div className="main-content">
                  <PageHeader
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                  />
                  <TableMap />
                </div>
              </div>
            }
          />
        </Routes>
      </RouteHandler>
    </BrowserRouter>
  );
};