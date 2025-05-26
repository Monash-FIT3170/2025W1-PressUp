import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { MenuCategories } from '/imports/api/menu-categories/menu-categories-collection'; // Adjust the path as needed
import './POSMenuControls.css';

export const POSMenuControls = ({ selectedCategory, setSelectedCategory}) => {

  const categories = useTracker(() => {
    Meteor.subscribe('menuCategories.all');
    const dbCategories = MenuCategories.find({}, { sort: { sortOrder: 1 } }).fetch();
    console.log('Fetched categories:', dbCategories);
    return ['All', ...dbCategories.map(c => c.category)];
  });
  
  return (
    <>
      <div className="filter-bar">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`filter-bubble ${selectedCategory === category ? 'active' : ''}`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>
    </>
  );
};