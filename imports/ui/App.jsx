import React, { useState, useEffect } from 'react';
import { Hello } from './Hello.jsx';
import { Info } from './Info.jsx';
import { Sidebar } from './Components/Sidebar.jsx';
import { MenuItemPopUp } from './Components/MenuItemPopUp.jsx'
import './AppStyle.css';
import { Card } from './Components/Card.jsx';


export const App = () => {
  const [currentPage, setCurrentPage] = useState('inventory'); // Default page is "Inventory"
  const [showPopup, setShowPopup] = useState(false); 
  const [menuItems, setMenuItems] = useState([]); 
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');

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

      return updatedItems;
    });
  };

  // Function to change the current page
  const changePage = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className='app-container'>
      <Sidebar changePage={changePage} currentPage={currentPage} /> {/* Pass changePage function to Sidebar */}

      <div className="main-content" style={{ marginLeft: '80px' }}>
        {/* Page title */}
        {currentPage === 'inventory' && <h1>Inventory</h1>}
        {currentPage === 'home' && <h1>Home</h1>}
        {currentPage === 'menu' && <h1>Menu</h1>}
        {currentPage === 'scheduling' && <h1>Scheduling</h1>}

        {/* Page content */}
        {currentPage === 'inventory' && (
          <>
            <Hello />
            <Info />
          </>
        )}

        {/* Additional content for other pages can be added below */}
        {currentPage === 'home' && <div>Welcome to the Home Page!</div>}
        {currentPage === 'menu' && (
          <div>
            <div className="header-text">Here is the Menu Page!</div>
            <button onClick={() => setShowPopup(true)} >Create Menu Item</button>
            {showPopup && <MenuItemPopUp onClose={() => setShowPopup(false)} addMenuItem={addMenuItem} />}
            {/*Filter Bar */}
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
                  .filter(item => {
                    if (selectedCategory === 'All') {
                      return true;
                    }
                    return item.menuCategory === selectedCategory;
                  })
                  .map(item => (
                    <Card
                      key={item.name}
                      title={item.name}
                      description={`Price: $${item.price}`}
                    />
                  ))
              )}
            </div>
          </div>
          )}
        {currentPage === 'scheduling' && <div>Scheduling Page Content!</div>}
      </div>
    </div>
  );
};
