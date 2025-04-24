import React, { useState, useEffect } from 'react';
import './Sidebar.css';

export const Sidebar = ({ changePage }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(prev => !prev);

  // When sidebar is toggled, update body class
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
  }, [isOpen]);

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
              <li><button className="sidebar-btn" onClick={() => changePage('home')}>Home</button> {/* Home Page */}</li>
              <li><button className="sidebar-btn" onClick={() => changePage('inventory')}>Inventory</button> {/* Inventory Page */}</li>
              <li><button className="sidebar-btn" onClick={() => changePage('menu')}>Menu</button> {/* Menu Page */}</li>
              <li><button className="sidebar-btn" onClick={() => changePage('scheduling')}>Scheduling</button> {/* Scheduling Page */}</li>
            </ul>
          </>
        )}
      </div>
    </>
  );
};
