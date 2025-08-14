import React, { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { MenuCategories } from '/imports/api/menu-categories/menu-categories-collection';
import { MenuItemPopUp } from './MenuItemPopUp.jsx';
import { PriceSchedulingPopup } from './PriceSchedulingPopup.jsx';
import { CategoryManager } from './CategoryPopUp.jsx';
import './MenuControls.css'


export const MenuControls = ({ selectedCategory, setSelectedCategory, compact = false }) => {
  console.log('selectedCategory:', selectedCategory);
  console.log('setSelectedCategory:', setSelectedCategory);

  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showSchedulingPopup, setShowSchedulingPopup] = useState(false);

  // const categories = useTracker(() => {
  //   Meteor.subscribe('menuCategories.all');
  //   const dbCategories = MenuCategories.find({}, { sort: { sortOrder: 1 } }).fetch();
  //   console.log('Fetched categories:', dbCategories);
  //   return ['All', ...dbCategories.map(c => c.category)];
  // });
  const categories = useTracker(() => {
    Meteor.subscribe('menuCategories.all');
    const dbCategories = MenuCategories.find({}, { sort: { sortOrder: 1 } }).fetch();
    return [{ _id: 'all', name: 'All' }, ...dbCategories.map(c => ({ _id: c._id, name: c.category }))];
  });


  const addMenuItem = (newMenuItem) => {
    setMenuItems((prevItems) => {
      const updatedItems = [...prevItems, newMenuItem];
  
      const uniqueCategories = [...new Set(
        updatedItems
          .map(item => item.menuCategory)
          .filter(category => category && category.trim() !== '')
      )];
      setCategories(['All', ...uniqueCategories]);
  
      return updatedItems;
    });
  };

  return (
    <>
      {/* Container at the top of the page, next to the search bar. */}
      <div className="menu-button-container">
        <button
          className="menu-top-button"
          onClick={() => setShowPopup(true)}
        >
          + New Menu Item
        </button>
        <button
          className="menu-top-button"
          onClick={() => setShowSchedulingPopup(true)}
        >
          Schedule Prices
        </button>
      </div>
      {/* Show the create menu item popup. */}
      {showPopup && (
        <MenuItemPopUp
          onClose={() => setShowPopup(false)}
          addMenuItem={addMenuItem}
          mode="create"
        />
      )}
      {/* Show the schedule prices popup. */}
      {showSchedulingPopup && (
  <PriceSchedulingPopup onClose={() => setShowSchedulingPopup(false)} />
)}
      <div className="filter-bar">
        {/* {categories.map((category) => (
          <button
            class="filter-bubble"
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`filter-bubble ${selectedCategory === category ? 'active' : ''}`}
          >
            {category}
          </button>
          
        ))} */}
        {categories.map(({ _id, name }) => (
          <button
            key={_id}
            onClick={() => setSelectedCategory(_id)}
            className={`filter-bubble ${selectedCategory === _id ? 'active' : ''}`}
          >
            {name.charAt(0).toUpperCase() + name.slice(1)}
          </button>
        ))}
        <button onClick={() => setShowCategoryManager(true)} className='add-category-button'>
          ✏️
        </button>
      </div>
      {showCategoryManager && <CategoryManager onClose={() => setShowCategoryManager(false)} />}
    </>
  );
};