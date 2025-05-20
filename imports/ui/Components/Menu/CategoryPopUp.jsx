import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import './CategoryPopUp.css'; // reuse the modal styling

export const CategoryManager = ({ onClose }) => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    Meteor.call('menuCategories.getCategories', (error, result) => {
      if (!error) setCategories(result);
    });
  }, []);

  const handleUpdate = (id, updatedCategory) => {
    Meteor.call('menuCategories.update', {
  _id: id,
  menuCategory: { name: updatedCategory }
}, (error) => {
  if (!error) {
    setCategories(prev =>
      prev.map(cat => cat._id === id ? { ...cat, category: updatedCategory } : cat)
    );
  }
});
  };

  const handleAdd = () => {
    if (!newCategory.trim()) return;
    Meteor.call('menuCategories.insert', { category: newCategory, sortOrder: categories.length }, (error, result) => {
  if (!error) {
    setCategories(prev => [...prev, { _id: result, category: newCategory, sortOrder: categories.length + 1 }]);
    setNewCategory('');
  }
});
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="close-button" onClick={onClose}>X</button>
        <h2>Manage Categories</h2>
        <ul>
          {categories.map(cat => (
            <li key={cat._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <input
                type="text"
                value={cat.category}
                onChange={(e) => handleUpdate(cat._id, e.target.value)}
                style={{ flex: 1, marginRight: '8px' }}
              />
              <span role="img" aria-label="edit">✏️</span>
            </li>
          ))}
        </ul>
        <div className="add-category-row">
          <input
            type="text"
            placeholder="New category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button onClick={handleAdd} style={{ marginLeft: '8px' }}>Add</button>
        </div>
      </div>
    </div>
  );
};
