// imports/ui/Components/SupplierTable/SupplierForm.jsx
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
      // Reset form for "add" mode or if no existing supplier
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const supplierData = {
      name: name.trim(),
      abn: abn.trim(),
      // products will be split into an array in the Meteor method
      products: products, 
      contact: contact.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      notes: notes, 
    };

    try {
      if (mode === 'edit' && existingSupplier?._id) {
        await Meteor.callAsync("suppliers.update", existingSupplier._id, supplierData);
        alert('Supplier updated successfully!');
        if (onSupplierUpdated) onSupplierUpdated(); 
      } else {
        await Meteor.callAsync("suppliers.insert", supplierData);
        alert('Supplier added successfully!');
        setName('');
        setAbn('');
        setProducts('');
        setContact('');
        setEmail('');
        setPhone('');
        setAddress('');
        setNotes('');
      }
      onClose(); 
    } catch (error) {
      alert(`Error: ${error.message}`);
      console.error("Error processing supplier:", error);
    }
  };

  return (// implement the pop-up functionality in a lil-bit
    <div className="modal-overlay">
      <div className="modal-content supplier-form-container">
        <div className="supplier-form-header">
          <div className="title">Add New Supplier</div>
        </div>
        <div className="supplier-form-input-container">
          {/* Name */}
          <div className="supplier-form-input">
            <div className="Name field"></div>
            <img src="/images/icon.svg" alt="Name" className="w-5 h-5" />
            <label>Name</label>
            <input
              name="name"
              placeholder="Name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          {/* ABN */}
          <div className="supplier-form-input">
            <div className="ABN field"></div>
            <img src="/images/Credit card.svg" alt="ABN" className="w-5 h-5" />
            <label>ABN</label>
            <input
              name="abn"
              placeholder="ABN"
              value={abn}
              onChange={e => setAbn(e.target.value)}
            />
          </div>
          {/* Products */}
          <div className="supplier-form-input">
            <div className="Products field"></div>
            <img src="/images/Package.svg" alt="Products" className="w-5 h-5" />
            <label>Products</label>
            <input
              name="products"
              placeholder="Products (comma-separated)"
              value={products}
              onChange={e => setProducts(e.target.value)}
            />
          </div>
          {/* Contact */}
          <div className="supplier-form-input">
            <div className="Contact field"></div>
            <img src="/images/icon.svg" alt="Contact" className="w-5 h-5" />
            <label>Contact</label>
            <input
              name="contact"
              placeholder="Contact"
              value={contact}
              onChange={e => setContact(e.target.value)}
            />
          </div>
          {/* Email */}
          <div className="supplier-form-input">
            <div className="Mail field"></div>
            <img src="/images/Mail.svg" alt="Email" className="w-5 h-5" />
            <label>Email</label>
            <input
              name="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          {/* Phone */}
          <div className="supplier-form-input">
            <div className="Phone field"></div>
            <img src="/images/Phone.svg" alt="Phone" className="w-5 h-5" />
            <label>Phone</label>
            <input
              name="phone"
              placeholder="Phone"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>
          {/* Address */}
          <div className="supplier-form-input">
            <div className="Home field"></div>
            <img src="/images/Home.svg" alt="Address" className="w-5 h-5" />
            <label>Address</label>
            <input
              name="address"
              placeholder="Address"
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
          </div>
          {/* Notes */}
          <div className="supplier-form-input">
            <div className="Notes field"></div>
            <img src="/images/File text.svg" alt="Notes" className="w-5 h-5" />
            <label>Notes</label>
            <input
              name="notes"
              placeholder="Notes (comma-separated)"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        </div>
        <div className="supplier-form-buttons">
          <div
            className="supplier-form-button cancel"
            onClick={onClose}
          >
            <div className="button-text">Cancel</div>
          </div>
          <div
            className="supplier-form-button done"
            onClick={handleSubmit}
          >
            <div className="button-text">Add</div>
          </div>
        </div>
      </div>
    // </div> // pop up functionality
  );
};