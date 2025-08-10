import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Meteor } from 'meteor/meteor';
import "./Sidebar.css";

export const Sidebar = ({ isOpen, setIsOpen, isAdmin }) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    Meteor.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
      } else {
        navigate('/login');
      }
    });
  };

  return (
    <>
      {/* Sidebar container */}
      <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
        {isOpen && (
          <>
            <div className="sidebar-header">
              <button onClick={() => setIsOpen(false)} className="close-btn">
                <img src="/images/CloseIcon.svg" alt="Close" />
              </button>
              <img src="/images/PressUpLogo.png" id="logo" alt="Logo" />
            </div>

            <div className="sidebar-content">
              <NavLink
                to="/pos"
                className={({ isActive }) =>
                  `sidebar-btn ${isActive ? "active" : ""}`
                }
                end
              >
                <img
                  src="/images/HomeIcon.png"
                  alt="Home"
                  style={{
                    width: "30px",
                    height: "30px",
                    verticalAlign: "-4px",
                    marginRight: "8px",
                  }}
                />
                Home
              </NavLink>
              
              {/* Only show these links if user is admin */}
              {isAdmin && (
                <>
                  <NavLink
                    to="/inventory"
                    className={({ isActive }) =>
                      `sidebar-btn ${isActive ? "active" : ""}`
                    }
                  >
                    <img
                      src="/images/InventoryIcon.png"
                      alt="Inventory"
                      style={{
                        width: "30px",
                        height: "30px",
                        verticalAlign: "-4px",
                        marginRight: "8px",
                      }}
                    />
                    Inventory
                  </NavLink>
                  
                  <NavLink
                    to="/menu"
                    className={({ isActive }) =>
                      `sidebar-btn ${isActive ? "active" : ""}`
                    }
                  >
                    <img
                      src="/images/MenuIcon.png"
                      alt="Menu"
                      style={{
                        width: "30px",
                        height: "30px",
                        verticalAlign: "-4px",
                        marginRight: "8px",
                      }}
                    />
                    Menu
                  </NavLink>
                  
                  <NavLink
                    to="/scheduling"
                    className={({ isActive }) =>
                      `sidebar-btn ${isActive ? "active" : ""}`
                    }
                  >
                    <img
                      src="/images/ScheduleIcon.png"
                      alt="Scheduling"
                      style={{
                        width: "30px",
                        height: "30px",
                        verticalAlign: "-4px",
                        marginRight: "8px",
                      }}
                    />
                    Scheduling
                  </NavLink>

                      <NavLink
                    to="/tables"
                    className={({ isActive }) =>
                      `sidebar-btn ${isActive ? "active" : ""}`
                    }
                  >
                    <img
                      src="/images/TableIcon.png"
                      alt="Tables"
                      style={{
                        width: "30px",
                        height: "30px",
                        verticalAlign: "-4px",
                        marginRight: "8px",
                      }}
                    />
                    Tables
                  </NavLink>

                  <NavLink
                    to="/promotions"
                    className={({ isActive }) =>
                      `sidebar-btn ${isActive ? "active" : ""}`
                    }
                  >
                    <img
                      src="/images/PromotionIcon.png"
                      alt="Promotions"
                      style={{
                        width: "30px",
                        height: "30px",
                        verticalAlign: "-4px",
                        marginRight: "8px",
                      }}
                    />
                    Promotions
                  </NavLink>
                  <NavLink
                    to="/customer-relations"
                    className={({ isActive }) =>
                      `sidebar-btn ${isActive ? "active" : ""}`
                    }
                  >
                    <img
                      src="/images/PromotionIcon.png"
                      alt="Customer Relations"
                      style={{
                        width: "30px",
                        height: "30px",
                        verticalAlign: "-4px",
                        marginRight: "8px",
                      }}
                    />
                    Customer Relations
                  </NavLink>
                </>
              )}
              
              {/* Logout button */}
              <div className="sidebar-logout">
                <button onClick={handleLogout} className="sidebar-btn logout-btn">
                <img
                    src="/images/logout.jpg"
                    alt="Logout"
                    style={{
                      width: "50px",
                      height: "50px",
                      verticalAlign: "-4px",
                      marginRight: "8px",
                    }}
                  />
                  Logout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};