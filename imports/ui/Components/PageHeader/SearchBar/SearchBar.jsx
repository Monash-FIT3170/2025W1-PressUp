import React, { useState } from "react";
import "./SearchBar.css";

export const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  return (
    <div className="search-container">
      <img src="/images/SearchIcon.svg" alt="Search" id="search-icon" />
      <input
        type="text"
        className="search-input"
        placeholder="Search"
        value={searchTerm}
        onChange={handleChange}
      />
    </div>
  );
};
