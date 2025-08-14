import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { AddPromotionForm } from './AddPromotionForm';
import './PromotionPage.css';

export const PromotionPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [promotions, setPromotions] = useState([]);

  const handleCloseForm = () => {
    setShowForm(false);
    fetchPromotions(); // Refresh after form closes
  };

  const fetchPromotions = async () => {
    try {
      const result = await Meteor.callAsync('promotions.getActive');
      setPromotions(result);
    } catch (error) {
      console.error('Failed to fetch promotions:', error);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  return (
    <div className="promotion-page" style={{ overflow: 'visible' }}>
      {/* + Button */}
      <button className="add-promotion-btn" onClick={() => setShowForm(true)}>
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

      {/* Active Promotions List */}
      <div className="promotions">
        <h2>Active Promotions</h2>
        {promotions.length === 0 ? (
          <p>No active promotions.</p>
        ) : (
          <ul>
            <div className="promotion-list">
            {promotions.map((promo) => (
              <div key={promo._id} className="promotion-card">
                <h3>{promo.name}</h3>
                <p>Type: {promo.type}</p>
                <p>Amount: {promo.amount}</p>
                <p>Scope: {promo.scope.type}{promo.scope.value ? ` - ${promo.scope.value}` : ''}</p>
                {promo.requiresCode && <p>Code: {promo.code}</p>}
                <p>Expires: {new Date(promo.expiresAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
          </ul>
        )}
      </div>
    </div>
  );
};
