// Sidebar.jsx
import React, { useState, useEffect } from "react";
import "./Sidebar.css";

export const Sidebar = ({ changePage, currentPage }) => {
  // Tracking whether the sidebar is open
  const [isOpen, setIsOpen] = useState(false);

  // Sidebar toggle
  const toggleSidebar = () => setIsOpen((prev) => !prev);

  // When sidebar is toggled, update body class
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
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
      <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
        {isOpen && (
          <>
            <div className="sidebar-header">
              <button onClick={toggleSidebar} className="close-btn">
                ×
              </button>
              <img src="/images/PressUpLogo.png" alt="Logo" />
            </div>
            <div className="sidebar-content">
              <button
                className={`sidebar-btn ${
                  currentPage === "home" ? "active" : ""
                }`}
                onClick={() => changePage("home")}
              >
                <img
                  src="/images/HomeIcon.png"
                  alt="Logo"
                  style={{
                    width: "30px",
                    height: "30px",
                    verticalAlign: "-4px",
                    marginRight: "8px",
                  }}
                />
                Home
              </button>
              <button
                className={`sidebar-btn ${
                  currentPage === "inventory" ? "active" : ""
                }`}
                onClick={() => changePage("inventory")}
              >
                <img
                  src="/images/InventoryIcon.png"
                  alt="Logo"
                  style={{
                    width: "30px",
                    height: "30px",
                    verticalAlign: "-4px",
                    marginRight: "8px",
                  }}
                />
                Inventory
              </button>
              <button
                className={`sidebar-btn ${
                  currentPage === "scheduling" ? "active" : ""
                }`}
                onClick={() => changePage("scheduling")}
              >
                <img
                  src="/images/ScheduleIcon.png"
                  alt="Logo"
                  style={{
                    width: "30px",
                    height: "30px",
                    verticalAlign: "-4px",
                    marginRight: "8px",
                  }}
                />
                Scheduling
              </button>
              <button
                className={`sidebar-btn ${
                  currentPage === "menu" ? "active" : ""
                }`}
                onClick={() => changePage("menu")}
              >
                <img
                  src="/images/MenuIcon.png"
                  alt="Logo"
                  style={{
                    width: "30px",
                    height: "30px",
                    verticalAlign: "-4px",
                    marginRight: "8px",
                  }}
                />
                Menu
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};
