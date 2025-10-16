import React, { useState, useEffect } from 'react';
import './SupplierForm.css';
import { Meteor } from 'meteor/meteor';

export const SupplierForm = ({ onClose, mode = 'add', existingSupplier = null, onSupplierUpdated }) => {
  const [name, setName] = useState('');
  const [abn, setAbn] = useState('');
  const [products, setProducts] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (mode === 'edit' && existingSupplier) {
      setName(existingSupplier.name || '');
      setAbn(existingSupplier.abn || '');
      setProducts(existingSupplier.products ? existingSupplier.products.join(', ') : '');
      setContact(existingSupplier.contact || '');
      setEmail(existingSupplier.email || '');
      setPhone(existingSupplier.phone || '');
      setAddress(existingSupplier.address || '');
      setNotes(existingSupplier.notes ? existingSupplier.notes.join(', ') : '');
    } else {
      setName('');
      setAbn('');
      setProducts('');
      setContact('');
      setEmail('');
      setPhone('');
      setAddress('');
      setNotes('');
    }
  }, [mode, existingSupplier]);

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (/\d/.test(name)) {
      newErrors.name = 'Name cannot contain numbers';
    }
    if (!abn.trim()) {
      newErrors.abn = 'ABN is required';
    } else {
      // Remove spaces for validation
      const abnDigits = abn.replace(/\s+/g, '');
      if (!/^\d{11}$/.test(abnDigits)) {
        newErrors.abn = 'ABN must be 11 digits';
      }
    }
    if (!contact.trim()) newErrors.contact = 'Contact is required';
    if (!phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\+?[0-9\s\-()]{7,15}$/.test(phone.trim())) {
      newErrors.phone = 'Invalid phone number';
    }
    if (!address.trim()) newErrors.address = 'Address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) return;

    const notesArray = notes.split(',').map(n => n.trim()).filter(Boolean);
    const productsArray = products.split(',').map(p => p.trim()).filter(Boolean);

    const supplierData = {
      name: name.trim(),
      abn: abn.trim(),
      products: productsArray,
      contact: contact.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      notes: notesArray,
    };

    try {
      if (mode === 'edit' && existingSupplier?._id) {
        await Meteor.callAsync("suppliers.update", existingSupplier._id, supplierData);
        alert('Supplier updated successfully!');
        onSupplierUpdated?.();
      } else {
        await Meteor.callAsync("suppliers.insert", supplierData);
        alert('Supplier added successfully!');
        setName(''); setAbn(''); setProducts(''); setContact('');
        setEmail(''); setPhone(''); setAddress(''); setNotes('');
      }
      onClose();
    } catch (error) {
      alert(`Error: ${error.message}`);
      console.error("Error processing supplier:", error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content supplier-form-container">
        <div className="supplier-form-header">
          <div className="title">{mode === 'edit' ? 'Edit Supplier' : 'Add New Supplier'}</div>
        </div>

        <form className="supplier-form-input-container" onSubmit={handleSubmit}>

          {/* Name */}
          <div className="supplier-form-input">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              placeholder="Name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          {/* ABN */}
          <div className="supplier-form-input">
            <label htmlFor="abn">ABN</label>
            <input
              id="abn"
              placeholder="ABN"
              value={abn}
              onChange={e => setAbn(e.target.value)}
            />
            {errors.abn && <span className="error">{errors.abn}</span>}
          </div>

          {/* Products */}
          <div className="supplier-form-input">
            <label htmlFor="products">Products</label>
            <input
              id="products"
              placeholder="Products (comma-separated)"
              value={products}
              onChange={e => setProducts(e.target.value)}
            />
          </div>

          {/* Contact */}
          <div className="supplier-form-input">
            <label htmlFor="contact">Contact</label>
            <input
              id="contact"
              placeholder="Contact"
              value={contact}
              onChange={e => setContact(e.target.value)}
            />
            {errors.contact && <span className="error">{errors.contact}</span>}
          </div>

          {/* Email */}
          <div className="supplier-form-input">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          {/* Phone */}
          <div className="supplier-form-input">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              type="tel"
              placeholder="Phone"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
            {errors.phone && <span className="error">{errors.phone}</span>}
          </div>

          {/* Address */}
          <div className="supplier-form-input">
            <label htmlFor="address">Address</label>
            <input
              id="address"
              placeholder="Address"
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
            {errors.address && <span className="error">{errors.address}</span>}
          </div>

          {/* Notes */}
          <div className="supplier-form-input">
            <label htmlFor="notes">Notes</label>
            <input
              id="notes"
              placeholder="Notes (comma-separated)"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div className="supplier-form-buttons">
            <button type="button" className="supplier-form-button cancel" onClick={onClose}>
              <div className="button-text">Cancel</div>
            </button>
            <button type="submit" className="supplier-form-button done">
              <div className="button-text">{mode === 'edit' ? 'Save Changes' : 'Add'}</div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
