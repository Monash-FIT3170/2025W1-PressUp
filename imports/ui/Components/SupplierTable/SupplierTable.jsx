import React, { useState } from "react";
import "./SupplierTable.css";
import { EditOverlay } from "../EditOverlay/EditOverlay.jsx";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { SuppliersCollection } from  "../../../api/suppliers/SuppliersCollection.js";
import { LoadingIndicator } from "../LoadingIndicator/LoadingIndicator.jsx";
import { capitalizeFirstLetter } from "../../../utils/utils.js";
import { SupplierForm } from "./SupplierForm.jsx";

export const SupplierTable = ({
  searchTerm = '',
  openOverlay,
  setOpenOverlay,
  overlayRef,
}) => {
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);

  const toggleDropdown = (key) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const isLoading = useSubscribe("suppliers.nameIncludes", searchTerm);
  const suppliers = useFind(() => SuppliersCollection.find({}), [searchTerm]);

  if (isLoading()) {
    return <LoadingIndicator />;
  }

  if (!suppliers || suppliers.length === 0) {
    return (
      <div className="no-results">
        {searchTerm ? (
          <>No Suppliers found matching "{searchTerm}"</>
        ) : (
          <>
            <div className="supplier-table-wrapper" style={{ overflow: 'visible' }}>
              <button
                className="add-supplier-btn"
                onClick={() => setShowAddModal(true)}
              >
                +
              </button>
              {showAddModal && <SupplierForm onClose={() => setShowAddModal(false)} />}
            </div>
            No Suppliers found
          </>
        )}
      </div>
    );
  }

  const headers = Object.keys(suppliers[0])
    .filter((header) => header !== "_id")
    .map((header) => capitalizeFirstLetter(header));
  headers.push("");

  return (
    <div className="supplier-table-wrapper" style={{ overflow: 'visible' }}>
      <button
        className="add-supplier-btn"
        onClick={() => setShowAddModal(true)}
      >
        +
      </button>

      <table
        className="supplier-table"
        style={{ overflow: 'visible', position: 'relative' }}
      >
        <thead>
          <tr>
            {headers.map((header, i) => (
              <th key={i}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier, index) => {
            const dropdownProducts = openDropdowns[`products-${index}`];
            const dropdownNotes = openDropdowns[`notes-${index}`];

            return (
              <tr key={index}>
                <td>{supplier.name}</td>
                <td>{supplier.abn}</td>
                {/* Products */}
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

                {/* Contact */}
                <td>{supplier.contact}</td>

                {/* Email */}
                <td>{supplier.email}</td>

                {/* Phone */}
                <td>{supplier.phone}</td>

                {/* Address */}
                <td>{supplier.address}</td>

                {/* Notes */}
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

                {/* Actions */}
                <td>
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={() =>
                        setOpenOverlay(
                          openOverlay === `supplier-${index}`
                            ? null
                            : `supplier-${index}`
                        )
                      }
                    >
                      <img
                        src="/images/MoreIcon.svg"
                        alt="More button"
                      />
                    </button>
                    {openOverlay === `supplier-${index}` && (
                      <div
                        ref={overlayRef}
                        style={{ overflow: 'visible' }}
                      >
                        <EditOverlay />
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {showAddModal && (
        <SupplierForm onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
};
