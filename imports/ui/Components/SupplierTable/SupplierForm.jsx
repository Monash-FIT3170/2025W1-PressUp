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
    e.preventDefault(); // needed for <form>

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

        {/* Wrap fields in a real form to enable native "required" validation */}
        <form className="supplier-form-input-container" onSubmit={handleSubmit}>
          {/* Name */}
          <div className="supplier-form-input">
            <div className="Name field"></div>
            <img src="/images/icon.svg" alt="Name" className="w-5 h-5" />
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              placeholder="Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          {/* ABN */}
          <div className="supplier-form-input">
            <div className="ABN field"></div>
            <img src="/images/Credit card.svg" alt="ABN" className="w-5 h-5" />
            <label htmlFor="abn">ABN</label>
            <input
              id="abn"
              name="abn"
              placeholder="ABN"
              value={abn}
              onChange={e => setAbn(e.target.value)}
              required
            />
          </div>

          {/* Products */}
          <div className="supplier-form-input">
            <div className="Products field"></div>
            <img src="/images/Package.svg" alt="Products" className="w-5 h-5" />
            <label htmlFor="products">Products</label>
            <input
              id="products"
              name="products"
              placeholder="Products (comma-separated)"
              value={products}
              onChange={e => setProducts(e.target.value)}
              required
            />
          </div>

          {/* Contact */}
          <div className="supplier-form-input">
            <div className="Contact field"></div>
            <img src="/images/icon.svg" alt="Contact" className="w-5 h-5" />
            <label htmlFor="contact">Contact</label>
            <input
              id="contact"
              name="contact"
              placeholder="Contact"
              value={contact}
              onChange={e => setContact(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="supplier-form-input">
            <div className="Mail field"></div>
            <img src="/images/Mail.svg" alt="Email" className="w-5 h-5" />
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Phone */}
          <div className="supplier-form-input">
            <div className="Phone field"></div>
            <img src="/images/Phone.svg" alt="Phone" className="w-5 h-5" />
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Phone"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>

          {/* Address */}
          <div className="supplier-form-input">
            <div className="Home field"></div>
            <img src="/images/Home.svg" alt="Address" className="w-5 h-5" />
            <label htmlFor="address">Address</label>
            <input
              id="address"
              name="address"
              placeholder="Address"
              value={address}
              onChange={e => setAddress(e.target.value)}
              required
            />
          </div>

          {/* Notes */}
          <div className="supplier-form-input">
            <div className="Notes field"></div>
            <img src="/images/File text.svg" alt="Notes" className="w-5 h-5" />
            <label htmlFor="notes">Notes</label>
            <input
              id="notes"
              name="notes"
              placeholder="Notes (comma-separated)"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div className="supplier-form-buttons">
            <button
              type="button"
              className="supplier-form-button cancel"
              onClick={onClose}
            >
              <div className="button-text">Cancel</div>
            </button>

            <button
              type="submit"
              className="supplier-form-button done"
            >
              <div className="button-text">{mode === 'edit' ? 'Save Changes' : 'Add'}</div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
