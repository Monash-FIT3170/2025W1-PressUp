import React, { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { MenuCategories } from '/imports/api/menu-categories/menu-categories-collection'; // Adjust the path as needed
import './POSMenuControls.css';

export const POSMenuControls = ({ selectedCategory, setSelectedCategory}) => {

  const [categories, setCategories] = useState([{ _id: 'all', name: 'All' }]);

  useEffect(() => {
    // Meteor.call('menuCategories.getCategories', (err, res) => {
    //   if (!err && Array.isArray(res)) {
    //     setCategories([
    //       { _id: 'all', name: 'All' },
    //       ...res.map(c => ({ _id: c._id, name: c.category }))
    //     ]);
    //   }
    // });
    (async () => {
      try {
        const res = await Meteor.callAsync('menuCategories.getCategories');
        if (Array.isArray(res)) {
          setCategories([
            { _id: 'all', name: 'All' },
            ...res.map(({ _id, category }) => ({ _id, name: category }))
          ]);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    })();

  }, []);

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