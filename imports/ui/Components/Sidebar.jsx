import React, { useState } from 'react';
import './Sidebar.css';

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(prev => !prev);

  return (
    <>
      {!isOpen && (
        <button onClick={toggleSidebar} className="hamburger-btn">
          ☰
        </button>
      )}

      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        {isOpen && (
          <>
            <button onClick={toggleSidebar} className="close-btn">×</button>
            <ul className="sidebar-list">
              <li><h2>Home</h2></li>
              <li><h2>Inventory</h2></li>
              <li><h2>Menu</h2></li>
              <li><h2>Scheduling</h2></li>
            </ul>
          </>
        )}
      </div>
    </>
  );
};
