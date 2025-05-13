import React, { useState } from "react";
import "./SupplierTable.css";
import { SupplierEditOverlay } from "../EditOverlay/SupplierEditOverlay.jsx";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { SuppliersCollection } from "../../../api/suppliers/SuppliersCollection.js";
import { LoadingIndicator } from "../LoadingIndicator/LoadingIndicator.jsx";
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

  return (
    <div className="supplier-table-wrapper" style={{ overflow: 'visible' }}>
      <button
        className="add-supplier-btn"
        onClick={() => setShowAddModal(true)}
      >
        +
      </button>

      {suppliers.map((supplier, index) => {
        const dropdownProducts = openDropdowns[`products-${index}`];
        const dropdownNotes = openDropdowns[`notes-${index}`];

        return (
          <div className="supplier-block" key={index}>
            <div className="supplier-name">{supplier.name}</div>
            <table className="supplier-table">
              <thead>
                <tr>
                  <th>ABN</th>
                  <th>Products</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Notes</th>
                  <th></th>
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
                      ⌄
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
                      aria-expanded={dropdownNotes ? "true" : "false"}
                    >
                      ⌄
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
                          <SupplierEditOverlay/>
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
        <SupplierForm onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
};
