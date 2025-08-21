import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { EnquiriesCollection } from "../../api/enquiries/enquiries-collection";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import { Meteor } from 'meteor/meteor'
import "./Sidebar.css";

export const Sidebar = ({ isOpen, setIsOpen, isAdmin }) => {
  const navigate = useNavigate();

  const isLoading = useSubscribe("enquiries.active");
  var enquiries = useTracker(()=> EnquiriesCollection.find({}).fetch());

  const existsActiveEnquiry = () => {
    var exists = false;
    var count = 0;
    for (i = 0;i < enquiries.length;i++) {
        if (enquiries[i].active) {
            exists = true;
            count += 1;
        }
    }
    return {'exists':exists,'count':count};
  }

  const enquiryCount = useTracker(()=>{
    enquiries = useTracker(()=> EnquiriesCollection.find({}).fetch());
    return enquiries.length
  })
  
  const handleLogout = () => {
    Meteor.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
      } else {
        navigate("/login");
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
                    to="/analytics"
                    className={({ isActive }) =>
                      `sidebar-btn ${isActive ? "active" : ""}`
                    }
                  >
                    <img
                      src="/images/Analytics.jpg"
                      alt="Promotions"
                      style={{
                        width: "30px",
                        height: "30px",
                        verticalAlign: "-4px",
                        marginRight: "8px",
                      }}
                    />
                    Analytics
                  </NavLink>
                  <NavLink
                    to="/inbox"
                    className={({ isActive }) =>
                      `sidebar-btn ${isActive ? "active" : ""}`
                    }
                  >
                    <img
                      src="/images/Mail.svg"
                      alt="Customer Relations"
                      style={{
                        width: "30px",
                        height: "30px",
                        verticalAlign: "-4px",
                        marginRight: "8px",
                      }}
                    />
                    Inbox {existsActiveEnquiry().exists && (`(`+existsActiveEnquiry().count+`)`)}
                  </NavLink>
                </>
              )}

              {/* Logout button */}
              <div className="sidebar-logout">
                <button
                  onClick={handleLogout}
                  className="sidebar-btn logout-btn"
                >
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
