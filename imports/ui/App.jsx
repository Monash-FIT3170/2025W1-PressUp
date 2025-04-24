import React, { useState } from 'react';
import { Hello } from './Hello.jsx';
import { Info } from './Info.jsx';
import { Sidebar } from './Components/Sidebar.jsx';
import './AppStyle.css';


export const App = () => {
  const [currentPage, setCurrentPage] = useState('inventory'); // Default page is "Inventory"

  // Function to change the current page
  const changePage = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className='app-container'>
      <Sidebar changePage={changePage} /> {/* Pass changePage function to Sidebar */}

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
        {currentPage === 'menu' && <div>Here is the Menu Page!</div>}
        {currentPage === 'scheduling' && <div>Scheduling Page Content!</div>}
      </div>
    </div>
  );
};
