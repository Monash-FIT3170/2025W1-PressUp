import React, { useState } from 'react';
import './menuItemSearchBar.css';

export const MenuItemSearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  return (
    <div className="search-container">
      <span className="search-icon">🔍</span>
      <input
        type="text"
        className="search-input"
        placeholder="Search Menu Items"
        value={searchTerm}
        onChange={handleChange}
      />
    </div>
  );
};