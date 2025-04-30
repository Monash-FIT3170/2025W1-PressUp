import React from "react";
import "./EditOverlay.css";

export const EditOverlay = () => {
    return (
        <div className="edit-overlay">
            <button className="edit-overlay-btn">
                <img src="/images/EditIcon.svg" alt="Edit" />
                <span>Edit</span>
            </button>
            <button className="edit-overlay-btn">
                <img src="/images/AddIcon.svg" alt="Resupply" />
                <span>Resupply</span>
            </button>
            <button className="edit-overlay-btn">
                <img src="/images/DeleteIcon.svg" alt="Edit" />
                <span id="delete">Delete</span>
            </button>
        </div>
    )
};
