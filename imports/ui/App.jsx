// imports/ui/App.jsx
import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Sidebar } from "./Components/Sidebar.jsx";
import { IngredientSearchBar } from "./Components/IngredientTable/ingredientSearchBar.jsx";
import { IngredientTable } from "./Components/IngredientTable/IngredientTable.jsx";
import { MenuItemPopUp } from "./Components/MenuItemPopUp.jsx";
import { Card } from "./Components/Card.jsx";
import { Hello } from './Hello.jsx';
import { Info } from './Info.jsx';
import './AppStyle.css';

export const App = () => {
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

      const uniqueCategories = [...new Set(
        updatedItems
          .map(item => item.menuCategory)
          .filter(category => category && category.trim() !== '')
      )];
      setCategories(['All', ...uniqueCategories]);

      return updatedItems;
    });
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
                <button onClick={() => setShowPopup(true)}>Create Menu Item</button>
                {showPopup && <MenuItemPopUp onClose={() => setShowPopup(false)} addMenuItem={addMenuItem} />}

                <div className="filter-bar">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`filter-bubble ${selectedCategory === category ? 'active' : ''}`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                <div className="card-container">
                  {menuItems.length === 0 ? (
                    <p>No menu items available.</p>
                  ) : (
                    menuItems
                      .filter(item => selectedCategory === 'All' || item.menuCategory === selectedCategory)
                      .map(item => (
                        <Card
                          key={item.name}
                          title={item.name}
                          description={`Price: $${item.price}`}
                        />
                      ))
                  )}
                </div>
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
