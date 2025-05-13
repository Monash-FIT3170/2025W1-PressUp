import React from "react";
import "./SupplierEditOverlay.css";
import {Meteor} from "meteor/meteor"

export const SupplierEditOverlay = ({id, onClose}) => {

    const handleDelete = async () => {

        if (!id) {
            console.error("No id cancelling delete")
            return 
        }

        try {
            await Meteor.callAsync("suppliers.remove", {id});
            onClose();
            
        } catch (err) {
            console.error("Failed to delete supplier", err)
        }
    }



    return (
        <div className="edit-overlay">
            <button className="edit-overlay-btn">
                <img src="/images/EditIcon.svg" alt="Edit" />
                <span>Edit</span>
            </button>
            <button className="edit-overlay-btn"
            onClick = {handleDelete}
            >
                <img src="/images/DeleteIcon.svg" alt="Edit" />
                <span id="delete">Delete</span>
            </button>
        </div>
    )
};
