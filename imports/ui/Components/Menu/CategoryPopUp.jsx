import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import './CategoryPopUp.css';

export const CategoryManager = ({ onClose }) => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [editValues, setEditValues] = useState({}); // to keep edited values per category
  const [activeEditId, setActiveEditId] = useState(null); // which category is active for edit

  useEffect(() => {
    Meteor.call('menuCategories.getCategories', (error, result) => {
      if (!error) setCategories(result);
    });
  }, []);

  const handleInputChange = (id, value) => {
    setEditValues(prev => ({ ...prev, [id]: value }));
  };

  const handleUpdate = (id) => {
    const updatedCategory = editValues[id];
    if (!updatedCategory || !updatedCategory.trim()) return;

    Meteor.call('menuCategories.update', {
      _id: id,
    //   category: updatedCategory.trim() 
    menuCategory: {
    category: updatedCategory.trim()
    // You can add sortOrder here if you want to update it
  }
    }, (error) => {
      if (!error) {
        setCategories(prev =>
          prev.map(cat => cat._id === id ? { ...cat, category: updatedCategory.trim() } : cat)
        );
        setActiveEditId(null); // close the edit buttons
      }
    });
  };

  const handleDelete = (id) => {
    console.log('Deleting category with id:', id);
    Meteor.call('menuCategories.remove', id, (error) => {
      if (!error) {
        setCategories(prev => prev.filter(cat => cat._id !== id));
        setActiveEditId(null);
      }
    });
  };

  const handleAdd = () => {
    if (!newCategory.trim()) return;

    Meteor.call('menuCategories.insert', { category: newCategory.trim(), sortOrder: categories.length }, (error, result) => {
      if (!error) {
        setCategories(prev => [...prev, { _id: result, category: newCategory.trim(), sortOrder: categories.length + 1 }]);
        setNewCategory('');
      }
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="close-button" onClick={() => {
          onClose();
          // window.location.reload(); // TODO: Remove this line. Currently used as editing menu throws error once category is updated
        }}>X</button>
        <h2>Manage Categories</h2>
        <ul>
          {categories.map(cat => (
            <li
              key={cat._id}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}
            >
              <input
                type="text"
                value={editValues[cat._id] !== undefined ? editValues[cat._id] : cat.category}
                onChange={(e) => handleInputChange(cat._id, e.target.value)}
                style={{ flex: 1, marginRight: '8px' }}
              />
              <span
                role="button"
                aria-label="edit"
                style={{ cursor: 'pointer', marginRight: '8px' }}
                onClick={() => setActiveEditId(cat._id === activeEditId ? null : cat._id)}
              >
                ✏️
              </span>

              {activeEditId === cat._id && (
                <>
                  <button onClick={() => handleUpdate(cat._id)}>Update</button>
                  <button onClick={() => handleDelete(cat._id)} style={{ marginLeft: '4px', color: 'red' }}>Delete</button>
                </>
              )}
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
