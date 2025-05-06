// imports/ui/App.jsx
import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Sidebar } from "./Components/Sidebar.jsx";
import { IngredientSearchBar } from "./Components/IngredientTable/ingredientSearchBar.jsx";
import { IngredientTable } from "./Components/IngredientTable/IngredientTable.jsx";
import { MenuItemPopUp } from "./Components/MenuItemPopUp.jsx";
import { Card } from "./Components/Card.jsx";
import "./AppStyle.css";
import { PageHeader } from "./Components/PageHeader/PageHeader.jsx";

export const App = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openOverlay, setOpenOverlay] = useState(null);
  const overlayRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    Meteor.call("menu.getAll", (error, result) => {
      if (error) {
        console.error("Error fetching menu items:", error);
      } else {
        setMenuItems(result);

        const uniqueCategories = [
          ...new Set(
            result
              .map((item) => item.menuCategory)
              .filter((category) => category && category.trim() !== "")
          ),
        ];
        setCategories(["All", ...uniqueCategories]);
      }
    });
  }, []);

  const addMenuItem = (newMenuItem) => {
    setMenuItems((prevItems) => {
      const updatedItems = [...prevItems, newMenuItem];

      const uniqueCategories = [
        ...new Set(
          updatedItems
            .map((item) => item.menuCategory)
            .filter((category) => category && category.trim() !== "")
        ),
      ];
      setCategories(["All", ...uniqueCategories]);

      return updatedItems;
    });
  };

  const deleteMenuItem = (itemId) => {
    Meteor.call('menu.remove', itemId, (error) => {
      if (error) {
        console.error('Error deleting menu item:', error);
      } else {
        setMenuItems((prevItems) => prevItems.filter(item => item._id !== itemId));
      }
    });
  };

  const changePage = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (overlayRef.current && !overlayRef.current.contains(event.target)) {
        setOpenOverlay(null);
      }
    };

    if (isSidebarOpen && !event.target.closest(".menu-icon-btn")) {
      setIsSidebarOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  return (
    <BrowserRouter>
      <div className={`app-container ${!isSidebarOpen ? "sidebar-closed" : ""}`}>
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className="main-content">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <PageHeader
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                  />
                </>
              }
            />
            <Route
              path="/inventory"
              element={
                <>
                  <PageHeader
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    searchBar={
                      <IngredientSearchBar
                        onSearch={handleSearch}
                      />
                    }
                  />
                  <IngredientTable
                    searchTerm={searchTerm}
                    openOverlay={openOverlay}
                    setOpenOverlay={setOpenOverlay}
                    overlayRef={overlayRef}
                  />
                </>
              }
            />
            <Route
              path="/menu"
              element={
                <>
                  <PageHeader
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                  />
                  <button onClick={() => setShowPopup(true)}>
                    Create Menu Item
                  </button>
                  {showPopup && (
                    <MenuItemPopUp
                      onClose={() => setShowPopup(false)}
                      addMenuItem={addMenuItem}
                    />
                  )}

                  <div className="filter-bar">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`filter-bubble ${
                          selectedCategory === category ? "active" : ""
                        }`}
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
                        .filter(
                          (item) =>
                            selectedCategory === "All" ||
                            item.menuCategory === selectedCategory
                        )
                        .map((item) => (
                          <Card
                            key={item._id}
                            title={item.name}
                            description={`Price: $${item.price}`}
                            onDelete={() => deleteMenuItem(item._id)}
                          />
                        ))
                    )}
                  </div>
                </>
              }
            />
            <Route
              path="/scheduling"
              element={
                <>
                  <PageHeader
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                  />
                </>
              }
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};