// SupplierForm.jsx
import React, { useState } from 'react';
import './SupplierForm.css';

export const SupplierForm = ({ setShowAddModal }) => {
  const [abn, setAbn] = useState('');
  const [products, setProducts] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!abn) return;

    await Meteor.callAsync("suppliers.insert", {
      abn: abn.trim(),
      products: products.split(',').map(item => item.trim()),
      contact: contact.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      notes: notes.split(',').map(item => item.trim()),
    });

    // reset all fields
    setAbn('');
    setProducts('');
    setContact('');
    setEmail('');
    setPhone('');
    setAddress('');
    setNotes('');
  };

  return ( // implement the pop-up functionality in a lil-bit
    <div className="modal-overlay">
      <div className="modal-content supplier-form-container">
        <div className="supplier-form-header">
          <div className="title">Add New Supplier</div>
        </div>
        <div className="supplier-form-input-container">
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
            onClick={() => setShowAddModal(false)}
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
