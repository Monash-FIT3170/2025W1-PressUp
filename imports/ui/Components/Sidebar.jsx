// imports/ui/Components/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

export const Sidebar = () => {
  // Tracking whether the sidebar is open
  const [isOpen, setIsOpen] = useState(false);

  // Sidebar toggle
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
      {/* Hamburger button to only show when the sidebar is closed */}
      {!isOpen && (
        <button onClick={toggleSidebar} className="hamburger-btn">
          ☰
        </button>
      )}

      {/* Sidebar container */}
      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        {isOpen && (
          <>
            {/* Close button on sidebar */}
            <button onClick={toggleSidebar} className="close-btn">×</button>

            {/* Logo on sidebar */}
            <div className="sidebar-logo">
              <img src="/images/PressUpLogo.png" alt="Logo" />
            </div>

            {/* Navigation list */}
            <ul className="sidebar-list">
              {/* Home page link */}
              <li>
                <NavLink
                  to="/"
                  className={({isActive}) => `sidebar-btn ${isActive ? 'active' : ''}`}
                  end
                >
                  <img src="/images/HomeIcon.png" alt="Home" 
                       style={{ width: '30px', height: '30px', verticalAlign: '-4px', marginRight: '8px'}} />
                  Home
                </NavLink>
              </li>
              {/* Inventory page link */}
              <li>
                <NavLink
                  to="/inventory"
                  className={({isActive}) => `sidebar-btn ${isActive ? 'active' : ''}`}
                >
                  <img src="/images/InventoryIcon.png" alt="Inventory" 
                       style={{ width: '30px', height: '30px', verticalAlign: '-4px', marginRight: '8px'}} />
                  Inventory
                </NavLink>
              </li>
              {/* Menu page link */}
              <li>
                <NavLink
                  to="/menu"
                  className={({isActive}) => `sidebar-btn ${isActive ? 'active' : ''}`}
                >
                  <img src="/images/MenuIcon.png" alt="Menu" 
                       style={{ width: '30px', height: '30px', verticalAlign: '-4px', marginRight: '8px'}} />
                  Menu
                </NavLink>
              </li>
              {/* Scheduling page link */}
              <li>
                <NavLink
                  to="/scheduling"
                  className={({isActive}) => `sidebar-btn ${isActive ? 'active' : ''}`}
                >
                  <img src="/images/ScheduleIcon.png" alt="Scheduling" 
                       style={{ width: '30px', height: '30px', verticalAlign: '-4px', marginRight: '8px'}} />
                  Scheduling
                </NavLink>
              </li>
            </ul>
          </>
        )}
      </div>
    </>
  );
};