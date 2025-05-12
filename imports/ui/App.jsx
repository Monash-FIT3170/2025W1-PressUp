// imports/ui/App.jsx
import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Sidebar } from "./Components/Sidebar.jsx";
import { IngredientSearchBar } from "./Components/IngredientTable/ingredientSearchBar.jsx";
import { IngredientTable } from "./Components/IngredientTable/IngredientTable.jsx";
import { MenuControls } from './Components/Menu/MenuControls.jsx';
import { MenuCards } from './Components/Menu/MenuCards.jsx';
import { Hello } from './Hello.jsx';
import { Info } from './Info.jsx';
//import './AppStyle.css';

export const App = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [existingItem, setExistingItem] = useState(null);
  const [openOverlay, setOpenOverlay] = useState(null);
  const overlayRef = useRef(null);

  const updateMenuItem = (item) => {
    setExistingItem(item);
    setShowPopup(true);
  }
  
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
                <h1>Inventory</h1>
                <IngredientSearchBar onSearch={(term) => console.log('Searching:', term)} />
                <IngredientTable
                  openOverlay={openOverlay}
                  setOpenOverlay={setOpenOverlay}
                  overlayRef={overlayRef}
                />
                <Hello />
                <Info />
              </>
            } />
            <Route path="/menu" element={
              <>
                <h1>Menu</h1>
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
                />
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
