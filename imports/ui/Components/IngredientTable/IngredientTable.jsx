import React from "react";
import "./IngredientTable.css";
import { EditOverlay } from "../EditOverlay/EditOverlay.jsx";

export const IngredientTable = ({
  openOverlay,
  setOpenOverlay,
  overlayRef,
}) => {
  const tableHeaders = ["Name", "Quantity", "Units", "Price", "Supplier", ""];

  const rows = [
    {
      name: "Arabica beans",
      quantity: 2,
      units: "kg",
      price: "$1.50",
      supplier: "John Doe",
    },
    {
      name: "Robusta beans",
      quantity: 2,
      units: "kg",
      price: "$1.50",
      supplier: "Alice Smith",
    },
    {
      name: "Liberica beans",
      quantity: 2,
      units: "kg",
      price: "$1.50",
      supplier: "Alex Wang",
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
