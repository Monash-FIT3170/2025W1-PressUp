// imports/ui/App.jsx
import React, { useState, useRef, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "./Components/Sidebar.jsx";
import { IngredientSearchBar } from "./Components/IngredientTable/ingredientSearchBar.jsx";
import { IngredientTable } from "./Components/IngredientTable/IngredientTable.jsx";
import { MenuItemPopUp } from './Components/MenuItemPopUp.jsx'
import './AppStyle.css';
import { Card } from './Components/Card.jsx';

export const App = () => {
  const [currentPage, setCurrentPage] = useState('inventory'); // Default page is "Inventory"
  const [showPopup, setShowPopup] = useState(false); 
  const [menuItems, setMenuItems] = useState([]); 
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openOverlay, setOpenOverlay] = useState(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    Meteor.call('menu.getAll', (error, result) => {
      if (error) {
        console.error('Error fetching menu items:', error);
      } else {
        setMenuItems(result);

        const uniqueCategories = [...new Set(
          result
            .map(item => item.menuCategory)
            .filter(category => category && category.trim() !== '')
        )];
        setCategories(['All', ...uniqueCategories]);
      }
    });
  }, []);

  const addMenuItem = (newMenuItem) => {
    setMenuItems((prevItems) => {
      const updatedItems = [...prevItems, newMenuItem];

      // Update categories when new item added
      const uniqueCategories = [...new Set(
        updatedItems
          .map(item => item.menuCategory)
          .filter(category => category && category.trim() !== '')
      )];
      setCategories(['All', ...uniqueCategories]);

      const handleClickOutside = (event) => {
        if (overlayRef.current && !overlayRef.current.contains(event.target)) {
          setOpenOverlay(null);
        }
      };
  
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };

      return updatedItems;
    });
  };

  // Function to change the current page
  const changePage = (page) => {
    setCurrentPage(page);
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <div className="main-content" style={{ marginLeft: "80px" }}>
          <Routes>
            <Route path="/" element={
              <>
                <h1>Home</h1>
                <div>Welcome to the Home Page!</div>
              </>
            } />
            <Route path="/inventory" element={
              <>
                <div className="page-header">
                  <div className="title-search-container">
                    <h1>Inventory</h1>
                    <IngredientSearchBar onSearch={(term) => console.log('Searching:', term)} />
                  </div>
                </div>
                <IngredientTable 
                  openOverlay={openOverlay} 
                  setOpenOverlay={setOpenOverlay} 
                  overlayRef={overlayRef} 
                />
              </>
            } />
            <Route path="/menu" element={
              <>
                <h1>Menu</h1>
                <div>Here is the Menu Page!</div>
              </>
            } />
            <Route path="/scheduling" element={
              <>
                <h1>Scheduling</h1>
                <div>Scheduling Page Content!</div>
              </>
            } />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};