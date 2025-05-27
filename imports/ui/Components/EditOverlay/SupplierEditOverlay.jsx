import React from "react";
import "./SupplierEditOverlay.css";
import {Meteor} from "meteor/meteor"

export const SupplierEditOverlay = ({ id, onClose, onEdit }) => { 
    const handleDelete = async () => {
      if (!id) {
        console.error("No id, cancelling delete");
        return;
      }
      // Optional: Add a confirmation dialog before deleting
      if (window.confirm("Are you sure you want to delete this supplier?")) {
        try {
          await Meteor.callAsync("suppliers.remove", id);
          onClose(); // Close the overlay
          // You might want to trigger a refresh of the supplier list here
        } catch (err) {
          console.error("Failed to delete supplier", err);
          alert(`Failed to delete supplier: ${err.message}`);
        }
      }
    };
    
    const handleEdit = () => {
        if (onEdit) {
          onEdit(id); 
        }
        onClose(); 
      };
    

      return (
        <div className="edit-overlay">
          <button className="edit-overlay-btn" onClick={handleEdit}> {/* Call handleEdit */}
            <img src="/images/EditIcon.svg" alt="Edit" />
            <span>Edit</span>
          </button>
          <button className="edit-overlay-btn" onClick={handleDelete}>
            <img src="/images/DeleteIcon.svg" alt="Delete" />
            <span id="delete">Delete</span>
          </button>
        </div>
      );
    };
