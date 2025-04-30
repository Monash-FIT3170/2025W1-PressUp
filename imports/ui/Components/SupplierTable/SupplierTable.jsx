
import React from "react";
import "./SupplierTable.css";
import { EditOverlay } from "../EditOverlay/EditOverlay.jsx";

export const IngredientTable = ({
  openOverlay,
  setOpenOverlay,
  overlayRef,
}) => {
  const tableHeaders = ["ABN", "Products", "Contact", "Email", "Phone", "Address","Notes"];

  const rows = [
    {
      abn: "Arabica beans",
      products: 2,
      contact: "kg",
      email: "$1.50",
      phone: "John Doe",
      address: "5 bonk ave, 3190 melbourne vic",
      notes: ""
    },
    {
        abn: "Arabica beans",
        products: 2,
        contact: "kg",
        email: "$1.50",
        phone: "John Doe",
        address: "5 bonk ave, 3190 melbourne vic",
        notes: ""
    },
    {
        abn: "Arabica beans",
        products: 2,
        contact: "kg",
        email: "$1.50",
        phone: "John Doe",
        address: "5 bonk ave, 3190 melbourne vic",
        notes: ""
    },
  ];

  return (
    <table className="ingredient-table">
      <thead>
        <tr>
          {tableHeaders.map((header, index) => (
            <th key={index}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            <td>{row.name}</td>
            <td>
              <div className="number-pill">{row.quantity}</div>
            </td>
            <td>{row.units}</td>
            <td>
              <div className="number-pill">{row.price}</div>
            </td>
            <td>{row.supplier}</td>
            <td>
              <div style={{ position: "relative" }}>
                <button
                  onClick={() =>
                    setOpenOverlay(
                      openOverlay === `ingredient-${rowIndex}`
                        ? null
                        : `ingredient-${rowIndex}`
                    )
                  }
                >
                  <img src="/images/MoreIcon.svg" alt="More button" />
                </button>
                {openOverlay === `ingredient-${rowIndex}` && (
                  <div ref={overlayRef}>
                    <EditOverlay />
                  </div>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
