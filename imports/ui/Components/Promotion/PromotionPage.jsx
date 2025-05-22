import React, { useState } from 'react';
import { AddPromotionForm } from './AddPromotionForm';
import './PromotionPage.css';

export const PromotionPage = () => {
  const [showForm, setShowForm] = useState(false);

  const handleCloseForm = () => {
    setShowForm(false);
  };

  return (
    <div className="promotion-page" style={{ overflow: 'visible' }}>
      <h1>Promotions</h1>
      <p>This is where you’ll manage your special deals and discounts.</p>

      {/* + Button */}
      <button
        className="add-promotion-btn"
        onClick={() => setShowForm(true)}
      >
        +
      </button>

      {/* Modal Form */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
           <AddPromotionForm onClose={handleCloseForm} />
          </div>
        </div>
      )}
    </div>
  );
};
