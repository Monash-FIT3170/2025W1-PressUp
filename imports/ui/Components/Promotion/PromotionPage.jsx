import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { AddPromotionForm } from './AddPromotionForm';
import { SendPromotionMessage } from './SendPromotionMessage';
import './PromotionPage.css';

export const PromotionPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [promotions, setPromotions] = useState([]);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [shareMethod, setShareMethod] = useState('email');
  const [shareMessage, setShareMessage] = useState('');

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

  const handleShareClick = () => {
    // Generates a general promotional message
    const defaultMessage = `Check out our current promotions! We have ${promotions.length} active deal${promotions.length !== 1 ? 's' : ''} available. Visit us to save on your next purchase!`;
    setShareMessage(defaultMessage);
    setShowSharePopup(true);
  };

  const handleCloseSharePopup = () => {
    setShowSharePopup(false);
    setShareMessage('');
    setShareMethod('email');
  };

  const handleSendPromotion = () => {
    // We cannot actually send the promotion so we'll just send to console for now.
    console.log('Sending promotion:', {
      method: shareMethod,
      message: shareMessage
    });

    alert(`Promotion shared via ${shareMethod}!`);
    handleCloseSharePopup();
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  return (
    <div className="promotion-page" style={{ overflow: 'visible' }}>

      {/* Floating Action Buttons */}
      <div className="floating-buttons">
        <button className="floating-btn share-promotion" onClick={handleShareClick}>
          ✉
        </button>
        <button className="floating-btn add-promotion" onClick={() => setShowForm(true)}>
          +
        </button>
      </div>

      {/* Modal Form for creating a new promotion*/}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <AddPromotionForm onClose={handleCloseForm} />
          </div>
        </div>
      )}

      {/* Modal Form for sending a promotional message*/}
      {showSharePopup && (
        <div className="modal-overlay">
          <div className="modal">
            <SendPromotionMessage onClose={handleCloseSharePopup} />
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
