import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';

import { ScheduledChanges } from '/imports/api/scheduled-changes/scheduled-changes-collection';
import { Menu } from '/imports/api/menu/menu-collection';
import '/imports/api/menu/menu-methods.js';

import './MenuItemPopUp.css'; // Reuse modal and form styling from MenuItemPopUp

/**
 * PriceSchedulingPopup allows users to schedule a future price change
 * for an existing menu item. It includes a form for selecting the item,
 * entering a new price, and specifying a scheduled time.
 */
export const PriceSchedulingPopup = ({ onClose }) => {
  // Form state
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [errors, setErrors] = useState({});

  /**
   * Fetch all menu items when the popup mounts.
   */
  useEffect(() => {
    Meteor.call('menu.getAll', (error, result) => {
      if (error) {
        console.error('Failed to fetch menu items:', error);
      } else {
        setMenuItems(result);
      }
    });
  }, []);

  /**
   * Subscribe to scheduled price changes and retrieve them from the database.
   * Filters to only changes related to the 'menu' collection where a price is set.
   */
  const scheduledChanges = useTracker(() => {
    Meteor.subscribe('scheduledChanges.all');
    return ScheduledChanges.find(
      {
        targetCollection: 'menu',
        'changes.price': { $exists: true },
      },
      { sort: { scheduledTime: -1 } }
    ).fetch();
  }, []);

  // Categorise changes based on whether the time is in the future or past
  const upcomingChanges = scheduledChanges.filter(
    (change) => new Date(change.scheduledTime) > new Date()
  );

  const pastChanges = scheduledChanges.filter(
    (change) => new Date(change.scheduledTime) <= new Date()
  );

  /**
   * Validates that all required fields are provided.
   */
  const validate = () => {
    const validationErrors = {};

    if (!selectedItemId) validationErrors.selectedItemId = 'Menu item is required.';
    if (!newPrice) validationErrors.newPrice = 'New price is required.';
    if (!scheduledTime) validationErrors.scheduledTime = 'Schedule time is required.';

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  /**
   * Handles the form submission to schedule a new price change.
   */
  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validate()) return;

    Meteor.call(
      'scheduledChanges.insert',
      'menu',
      selectedItemId,
      { price: parseFloat(newPrice) },
      new Date(scheduledTime),
      (error) => {
        if (error) {
          alert('Failed to schedule price change: ' + error.reason);
        } else {
          setSelectedItemId('');
          setNewPrice('');
          setScheduledTime('');
          setErrors({});
          onClose();
        }
      }
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="close-button" onClick={onClose}>X</button>
        <h2>Schedule Price Change</h2>

        <form onSubmit={handleSubmit}>
          {/* Menu item selection */}
          <div>
            <label>Menu Item</label>
            <select value={selectedItemId} onChange={(e) => setSelectedItemId(e.target.value)}>
              <option value="">-- Select --</option>
              {menuItems.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
            {errors.selectedItemId && <div className="error">{errors.selectedItemId}</div>}
          </div>

          {/* New price input */}
          <div>
            <label>New Price</label>
            <input
              type="number"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              placeholder="e.g. 9.99"
            />
            {errors.newPrice && <div className="error">{errors.newPrice}</div>}
          </div>

          {/* Schedule time input */}
          <div>
            <label>Schedule Time</label>
            <input
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
            {errors.scheduledTime && <div className="error">{errors.scheduledTime}</div>}
          </div>

          <button type="submit">Schedule</button>
        </form>

        {/* Display upcoming changes */}
        <h3>Upcoming</h3>
        <ul>
          {upcomingChanges.length === 0 && <li>No upcoming changes.</li>}
          {upcomingChanges.map((change) => {
            const item = menuItems.find((m) => m._id === change.targetId);
            return (
              <li key={change._id}>
                {item?.name || 'Unknown item'}: ${change.changes.price.toFixed(2)} at{' '}
                {new Date(change.scheduledTime).toLocaleString()}
              </li>
            );
          })}
        </ul>

        {/* Display past changes */}
        <h3>Past</h3>
        <ul>
          {pastChanges.length === 0 && <li>No past changes.</li>}
          {pastChanges.map((change) => {
            const item = menuItems.find((m) => m._id === change.targetId);
            return (
              <li key={change._id}>
                {item?.name || 'Unknown item'}: ${change.changes.price.toFixed(2)} at{' '}
                {new Date(change.scheduledTime).toLocaleString()}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};