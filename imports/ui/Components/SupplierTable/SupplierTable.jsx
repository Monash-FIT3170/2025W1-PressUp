// imports/ui/Components/SupplierTable/SupplierTable.jsx
import React, { useState, useCallback } from "react"; // Added useCallback
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
  
  // State for editing
  const [editingSupplier, setEditingSupplier] = useState(null); // Store the supplier object to edit
  const [showEditModal, setShowEditModal] = useState(false);

  const isLoading = useSubscribe("suppliers.nameIncludes", searchTerm); 

  const suppliers = useFind(() => {
    const query = {};
    if (searchTerm) {
      query.name = { $regex: searchTerm, $options: "i" };
    }
    return SuppliersCollection.find(query, { sort: { name: 1 } }); // Sort by name
  }, [searchTerm]);


  const toggleDropdown = (key) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleEditSupplier = useCallback((supplierId) => { 
    const supplierToEdit = suppliers.find(s => s._id === supplierId);
    if (supplierToEdit) {
      setEditingSupplier(supplierToEdit);
      setShowEditModal(true);
      setOpenOverlay(null); 
    }
  }, [suppliers, setOpenOverlay]); 

  const handleSupplierUpdated = () => {
    // might need to refresh???
  };

  if (isLoading()) {
    return <LoadingIndicator />;
  }

  return (
    <div className="supplier-table-wrapper" style={{ overflow: 'visible' }}>
      <button
        className="add-supplier-btn"
        onClick={() => {
          setEditingSupplier(null); // Ensure not in edit mode
          setShowAddModal(true);
        }}
      >
        +
      </button>

      {suppliers.map((supplier) => { // Removed index, use supplier._id for keys
        const dropdownProducts = openDropdowns[`products-${supplier._id}`];
        const dropdownNotes = openDropdowns[`notes-${supplier._id}`];

        return (
          <div className="supplier-block" key={supplier._id}> 
              <div className="supplier-name">{supplier.name}</div>
              <table className="supplier-table">
                <thead><tr><th>ABN</th><th>Products</th><th>Contact</th><th>Email</th><th>Phone</th><th>Address</th><th>Notes</th><th></th></tr></thead>
                <tbody><tr>
                  <td>{supplier.abn}</td>
                  <td>
                    <div
                      className="dropdown-toggle"
                      onClick={() => toggleDropdown(`products-${supplier._id}`)}
                      aria-expanded={dropdownProducts ? "true" : "false"}
                    >
                      {dropdownProducts ? 'Hide' : `${supplier.products?.length || 0} items`} ⌄
                    </div>
                    {dropdownProducts && supplier.products && (
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
                      onClick={() => toggleDropdown(`notes-${supplier._id}`)}
                      aria-expanded={dropdownNotes ? "true" : "false"}
                    >
                       {dropdownNotes ? 'Hide' : `${supplier.notes?.length || 0} notes`} ⌄
                    </div>
                    {dropdownNotes && supplier.notes && (
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
                            openOverlay === `supplier-${supplier._id}`
                              ? null
                              : `supplier-${supplier._id}`
                          )
                        }
                      >
                        <img src="/images/MoreIcon.svg" alt="More button" />
                      </button>
                      {openOverlay === `supplier-${supplier._id}` && (
                        <div ref={el => { if (el && overlayRef) overlayRef.current = el; }} style={{ overflow: 'visible' }}>
                          <SupplierEditOverlay
                            id={supplier._id}
                            onClose={() => setOpenOverlay(null)}
                            onEdit={() => handleEditSupplier(supplier._id)} 
                          />
                        </div>
                      )}
                    </div>
                  </td>
                </tr></tbody>
              </table>
            </div>
        );
      })}

      {showAddModal && (
        <SupplierForm
          mode="add"
          onClose={() => setShowAddModal(false)}
          onSupplierUpdated={handleSupplierUpdated} 
        />
      )}

      {showEditModal && editingSupplier && (
        <SupplierForm
          mode="edit"
          existingSupplier={editingSupplier}
          onClose={() => {
            setShowEditModal(false);
            setEditingSupplier(null);
          }}
          onSupplierUpdated={handleSupplierUpdated}
        />
      )}
      
      {(!suppliers || suppliers.length === 0) && !isLoading() && (
         <div className="no-results" style={{marginTop: '20px'}}>
           {searchTerm ? `No Suppliers found matching "${searchTerm}"` : 'No Suppliers found. Click the "+" button to add one.'}
         </div>
      )}
    </div>
  );
};