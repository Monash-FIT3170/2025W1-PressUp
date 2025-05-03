import React, { useState, useRef } from "react";
import "./SupplierTable.css";

import { EditOverlay } from "../EditOverlay/EditOverlay.jsx";

export const SupplierTable = () => {
  const [openOverlay, setOpenOverlay] = useState(null);
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    abn: "",
    products: "",
    contact: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });

  const [suppliers, setSuppliers] = useState([
    {
      name: "John Doe",
      abn: "24 392 710 462",
      products: ["Beans", "Grinders", "Machines"],
      contact: "Jerry",
      email: "Jerry@gmail.com",
      phone: "0427382992",
      address: "5 bonk ave, 3190 melbourne vic",
      notes: ["Ships weekly", "Prefers email"],
    },
    {
      name: "Alice Smith",
      abn: "24 392 710 462",
      products: ["Milk", "Cups"],
      contact: "Jerry",
      email: "Jerry@gmail.com",
      phone: "0427382992",
      address: "5 bonk ave, 3190 melbourne vic",
      notes: ["Pays on time"],
    },
    {
      name: "Alex Wang",
      abn: "24 392 710 462",
      products: ["Coffee Machines"],
      contact: "Jerry",
      email: "Jerry@gmail.com",
      phone: "0427382992",
      address: "5 bonk ave, 3190 melbourne vic",
      notes: ["High-volume orders"],
    },
  ]);

  const overlayRef = useRef(null);

  // Add the toggleDropdown function
  const toggleDropdown = (key) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSupplier((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSupplier = () => {
    const supplierToAdd = {
      ...newSupplier,
      products: newSupplier.products.split(",").map((item) => item.trim()),
      notes: newSupplier.notes.split(",").map((item) => item.trim()),
    };

    setSuppliers((prev) => [...prev, supplierToAdd]);
    setNewSupplier({
      name: "",
      abn: "",
      products: "",
      contact: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
    });
    setShowAddModal(false);
  };

  const tableHeaders = [
    "ABN",
    "Products",
    "Contact",
    "Email",
    "Phone",
    "Address",
    "Notes",
    "",
  ];

  return (
    <div className="supplier-table-wrapper">
      <button className="add-supplier-btn" onClick={() => setShowAddModal(true)}>
        +
      </button>

      {suppliers.map((supplier, index) => {
        const dropdownProducts = openDropdowns[`products-${index}`];
        const dropdownNotes = openDropdowns[`notes-${index}`];

        return (
          <div key={index} className="supplier-section">
            <h3>{supplier.name}</h3>
            <table className="supplier-table">
              <thead>
                <tr>
                  {tableHeaders.map((header, i) => (
                    <th key={i}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{supplier.abn}</td>
                  <td>
                    <div
                      className="dropdown-toggle"
                      onClick={() => toggleDropdown(`products-${index}`)}
                      aria-expanded={dropdownProducts ? "true" : "false"}
                    >
                      Products ▼
                    </div>
                    {dropdownProducts && (
                      <ul className="dropdown-content">
                        {supplier.products.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td>{supplier.contact}</td>
                  <td>{supplier.email}</td>
                  <td>{supplier.phone}</td>
                  <td>{supplier.address}</td>
                  <td>
                    <div
                      className="dropdown-toggle"
                      onClick={() => toggleDropdown(`notes-${index}`)}
                    >
                      Notes ▼
                    </div>
                    {dropdownNotes && (
                      <ul className="dropdown-content">
                        {supplier.notes.map((note, i) => (
                          <li key={i}>{note}</li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td>
                    <div style={{ position: "relative" }}>
                      <button
                        onClick={() =>
                          setOpenOverlay(
                            openOverlay === `supplier-${index}` ? null : `supplier-${index}`
                          )
                        }
                      >
                        <img src="/images/MoreIcon.svg" alt="More button" />
                      </button>
                      {openOverlay === `supplier-${index}` && (
                        <div ref={overlayRef}>
                          <EditOverlay />
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      })}

{showAddModal && (
  <div className="modal-overlay">
    <div className="modal-content supplier-form-container">
      <div className="supplier-form-header">
        <div className="title">Add New Supplier</div>
      </div>
      <div className="supplier-form-input-container">
        <div className="supplier-form-input">
          <div className="icon-placeholder"></div>
          <label>Name</label>
          <input
            name="name"
            placeholder="Name"
            value={newSupplier.name}
            onChange={handleInputChange}
          />
        </div>
        <div className="supplier-form-input">
          <div className="icon-placeholder"></div>
          <label>ABN</label>
          <input
            name="abn"
            placeholder="ABN"
            value={newSupplier.abn}
            onChange={handleInputChange}
          />
        </div>
        <div className="supplier-form-input">
          <div className="icon-placeholder"></div>
          <label>Products</label>
          <input
            name="products"
            placeholder="Products (comma-separated)"
            value={newSupplier.products}
            onChange={handleInputChange}
          />
        </div>
        <div className="supplier-form-input">
          <div className="icon-placeholder"></div>
          <label>Contact</label>
          <input
            name="contact"
            placeholder="Contact"
            value={newSupplier.contact}
            onChange={handleInputChange}
          />
        </div>
        <div className="supplier-form-input">
          <div className="icon-placeholder"></div>
          <label>Email</label>
          <input
            name="email"
            placeholder="Email"
            value={newSupplier.email}
            onChange={handleInputChange}
          />
        </div>
        <div className="supplier-form-input">
          <div className="icon-placeholder"></div>
          <label>Phone</label>
          <input
            name="phone"
            placeholder="Phone"
            value={newSupplier.phone}
            onChange={handleInputChange}
          />
        </div>
        <div className="supplier-form-input">
          <div className="icon-placeholder"></div>
          <label>Address</label>
          <input
            name="address"
            placeholder="Address"
            value={newSupplier.address}
            onChange={handleInputChange}
          />
        </div>
        <div className="supplier-form-input">
          <div className="icon-placeholder"></div>
          <label>Notes</label>
          <input
            name="notes"
            placeholder="Notes (comma-separated)"
            value={newSupplier.notes}
            onChange={handleInputChange}
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
          onClick={handleAddSupplier}
        >
          <div className="button-text">Add</div>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};
