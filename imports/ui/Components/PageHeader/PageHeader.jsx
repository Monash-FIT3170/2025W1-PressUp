// imports/ui/Components/PageHeader/PageHeader.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import "./PageHeader.css";
import { capitalizeFirstLetter } from "../../../utils/utils.js";

export const PageHeader = ({ isSidebarOpen, setIsSidebarOpen, searchBar, addButton }) => {
  const location = useLocation();

  let title;
  if (location.pathname.startsWith("/training")) {
    // Always show "Training" for training main page and module detail pages
    title = "Training";
  } else {
    // Default behaviour: derive from pathname
    title = capitalizeFirstLetter(
      location.pathname.replace("/", "") || "Home"
    );
  }

  return (
    <div className="page-header">
      {!isSidebarOpen && (
        <button
          className="menu-icon-btn"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open menu"
        >
          <img
            src="/images/MenuIcon.svg"
            alt="Menu"
            style={{ width: 40, height: 40 }}
          />
        </button>
      )}
      <h1>{title}</h1>
      {searchBar}
      {addButton}
    </div>
  );
};
