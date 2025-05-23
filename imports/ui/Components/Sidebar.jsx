import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

export const Sidebar = ({ isOpen, setIsOpen }) => {
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
                to="/"
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
            </div>
          </>
        )}
      </div>
    </>
  );
};
