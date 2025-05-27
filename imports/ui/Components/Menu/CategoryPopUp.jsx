import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import './CategoryPopUp.css';

// Helper: wrap Meteor.call in a Promise to use async/await if preferred
const callMeteorMethod = (methodName, ...args) => {
  return new Promise((resolve, reject) => {
    Meteor.call(methodName, ...args, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
};

export const CategoryManager = ({ onClose }) => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [editValues, setEditValues] = useState({});
  const [activeEditId, setActiveEditId] = useState(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const result = await callMeteorMethod('menuCategories.getCategories');
        if (Array.isArray(result)) {
          setCategories(result);
        } else {
          console.error('Unexpected result from menuCategories.getCategories:', result);
          setCategories([]);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategories([]);
      }
    }
    fetchCategories();
  }, []);

  const handleInputChange = (id, value) => {
    setEditValues(prev => ({ ...prev, [id]: value }));
  };

  const handleUpdate = async (id) => {
    const updatedCategory = editValues[id];
    if (!updatedCategory || !updatedCategory.trim()) return;

    try {
      await callMeteorMethod('menuCategories.update', {
        _id: id,
        menuCategory: { category: updatedCategory.trim() }
      });
      setCategories(prev =>
        prev.map(cat => (cat._id === id ? { ...cat, category: updatedCategory.trim() } : cat))
      );
      setActiveEditId(null);
    } catch (err) {
      console.error('Error updating category:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await callMeteorMethod('menuCategories.remove', id);
      setCategories(prev => prev.filter(cat => cat._id !== id));
      setActiveEditId(null);
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  const handleAdd = async () => {
    if (!newCategory.trim()) return;

    try {
      const result = await callMeteorMethod('menuCategories.insert', {
        category: newCategory.trim(),
        sortOrder: categories.length
      });
      setCategories(prev => [...prev, { _id: result, category: newCategory.trim(), sortOrder: categories.length }]);
      setNewCategory('');
    } catch (err) {
      console.error('Error adding category:', err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="close-button" onClick={onClose}>X</button>
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
