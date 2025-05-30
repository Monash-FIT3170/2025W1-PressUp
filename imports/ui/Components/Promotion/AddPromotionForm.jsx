import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import '/imports/api/promotions/promotions-methods.js';

export const AddPromotionForm = ({ onClose }) => {
  const [form, setForm] = useState({
    name: '',
    type: 'flat',
    amount: '',
    scopeType: 'all',
    scopeValue: '',
    code: '',
    requiresCode: false,
    expiresAt: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async(e) => {
    e.preventDefault();

    const data = {
      name: form.name,
      code: form.code || undefined,
      type: form.type,
      amount: parseFloat(form.amount),
      scope: {
        type: form.scopeType,
        value: form.scopeType === 'all' ? undefined : form.scopeValue,
      },
      requiresCode: form.requiresCode,
      expiresAt: new Date(form.expiresAt),
    };

    try {
      await Meteor.callAsync('promotions.insert', data);
      alert('Promotion added!');
      setForm({
        name: '',
        type: 'flat',
        amount: '',
        scopeType: 'all',
        scopeValue: '',
        code: '',
        requiresCode: false,
        expiresAt: '',
      });
      onClose?.(); // Automatically close form if `onClose` is provided
    } catch (err) {
      alert(err.reason || 'An error occurred while adding the promotion.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-promotion-form">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Add Promotion</h3>
        <button type="button" className="close-button" onClick={onClose}>✕</button>
      </div>

      <label>Promotion Name:</label>
        <input
        type="text"
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder=" "
        required
        />

      <label>Type:</label>
      <select name="type" value={form.type} onChange={handleChange}>
        <option value="flat">Flat</option>
        <option value="percentage">Percentage</option>
      </select>

      <label>Amount:</label>
      <input
        type="number"
        name="amount"
        value={form.amount}
        onChange={handleChange}
        required
      />

      <label>Scope Type:</label>
      <select name="scopeType" value={form.scopeType} onChange={handleChange}>
        <option value="all">All Items</option>
        <option value="category">Category</option>
        <option value="item">Item</option>
      </select>

      {form.scopeType !== 'all' && (
        <>
          <label>Scope Value:</label>
          <input
            type="text"
            name="scopeValue"
            value={form.scopeValue}
            onChange={handleChange}
            required
          />
        </>
      )}

      <label>Promo Code (optional):</label>
      <input
        type="text"
        name="code"
        value={form.code}
        onChange={handleChange}
      />

      <label>
        <input
          type="checkbox"
          name="requiresCode"
          checked={form.requiresCode}
          onChange={handleChange}
        />
        Requires Code
      </label>

      <label>Expires At:</label>
      <input
        type="datetime-local"
        name="expiresAt"
        value={form.expiresAt}
        onChange={handleChange}
        required
      />

      <button type="submit">Add Promotion</button>
    </form>
  );
};
