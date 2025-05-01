import React, { useState, useRef } from "react";
import "./SupplierTable.css"; 
import { EditOverlay } from "../EditOverlay/EditOverlay.jsx";

export const SupplierTable = () => {
  const [openOverlay, setOpenOverlay] = useState(null);
  const [openDropdowns, setOpenDropdowns] = useState({}); 
  const overlayRef = useRef(null);

  const toggleDropdown = (key) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const tableHeaders = [
    "ABN",
    "Products",
    "Contact",
    "Email",
    "Phone",
    "Address",
    "Notes",
    ""
  ];

  const suppliers = [
    {
      name: "John Doe",
      abn: "24 392 710 462",
      products: ["Beans","Grinders",["Machines"]],
      contact: "Jerry",
      email: "Jerry@gmail.com",
      phone: "0427382992",
      address: "5 bonk ave, 3190 melbourne vic",
      notes: ["Ships weekly","Prefers email"],
    },
    {
      name: "Alice Smith",
      abn: "24 392 710 462",
      products: "▼",
      contact: "Jerry",
      email: "Jerry@gmail.com",
      phone: "0427382992",
      address: "5 bonk ave, 3190 melbourne vic",
      notes: "▼",
    },
    {
      name: "Alex Wang",
      abn: "24 392 710 462",
      products: "▼",
      contact: "Jerry",
      email: "Jerry@gmail.com",
      phone: "0427382992",
      address: "5 bonk ave, 3190 melbourne vic",
      notes: "▼",
    },
  ];

  return (
    <div className="supplier-table-wrapper">
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
    </div>
  );
};
