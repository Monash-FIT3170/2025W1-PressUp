import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { MenuCategories } from '/imports/api/menu-categories/menu-categories-collection'; // Adjust the path as needed
import './POSMenuControls.css';

export const POSMenuControls = ({ selectedCategory, setSelectedCategory}) => {

  // const categories = useTracker(() => {
  //   Meteor.subscribe('menuCategories.all');
  //   const dbCategories = MenuCategories.find({}, { sort: { sortOrder: 1 } }).fetch();
  //   console.log('Fetched categories:', dbCategories);
  //   return ['All', ...dbCategories.map(c => c.category)];
  // });
  const categories = useTracker(() => {
      Meteor.subscribe('menuCategories.all');
      const dbCategories = MenuCategories.find({}, { sort: { sortOrder: 1 } }).fetch();
      console.log('Fetched categories:', dbCategories);
      return [{ _id: 'all', name: 'All' }, ...dbCategories.map(c => ({ _id: c._id, name: c.category }))];
    });

  return (
    <>
      <div className="filter-bar">
        {categories.map(({ _id, name }) => (
          <button
            key={_id}
            onClick={() => setSelectedCategory(_id)}
            className={`filter-bubble ${selectedCategory === _id ? 'active' : ''}`}
          >
            {name.charAt(0).toUpperCase() + name.slice(1)}
          </button>
        ))}
      </div>
    </>
  );
};