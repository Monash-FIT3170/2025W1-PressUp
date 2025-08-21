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
  
  // Loyalty discount settings state
  const [loyaltySettings, setLoyaltySettings] = useState({
    fivePercent: 10,
    tenPercent: 20,
    fifteenPercent: 30,
    twentyPercent: 40
  });
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

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

  const fetchLoyaltySettings = async () => {
    try {
      const result = await Meteor.callAsync('loyaltySettings.get');
      if (result) {
        setLoyaltySettings(result);
      }
    } catch (error) {
      console.error('Failed to fetch loyalty settings:', error);
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

  const handleLoyaltySettingChange = (discountType, value) => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 0) return;
    
    setLoyaltySettings(prev => ({
      ...prev,
      [discountType]: numValue
    }));
  };

  const saveLoyaltySettings = async () => {
  setIsUpdatingSettings(true);
  try {
    // Only send the numeric fields that the server expects
    const settingsToSave = {
      fivePercent: loyaltySettings.fivePercent,
      tenPercent: loyaltySettings.tenPercent,
      fifteenPercent: loyaltySettings.fifteenPercent,
      twentyPercent: loyaltySettings.twentyPercent
    };
    
    await Meteor.callAsync('loyaltySettings.update', settingsToSave);
    alert('Loyalty settings updated successfully!');
  } catch (error) {
    console.error('Failed to update loyalty settings:', error);
    alert('Failed to update loyalty settings. Please try again.');
  } finally {
    setIsUpdatingSettings(false);
  }
};

  useEffect(() => {
    fetchPromotions();
    fetchLoyaltySettings();
  }, []);

  return (
    <div className="promotion-page" style={{ overflow: 'visible' }}>
      {/* Split Layout Container */}
      <div className="promotion-content-split">
        
        {/* Left Side - Loyalty Settings */}
        <div className="loyalty-settings-section">
          <div className="loyalty-settings-card">
            <h2>Loyalty Discount Settings</h2>
            <p className="settings-description">
              Configure the minimum loyalty points required for each discount tier:
            </p>
            
            <div className="loyalty-input-group">
              <label htmlFor="five-percent">5% Discount:</label>
              <div className="input-with-suffix">
                <input
                  id="five-percent"
                  type="number"
                  min="0"
                  value={loyaltySettings.fivePercent}
                  onChange={(e) => handleLoyaltySettingChange('fivePercent', e.target.value)}
                  className="loyalty-input"
                />
                <span className="input-suffix">points</span>
              </div>
            </div>

            <div className="loyalty-input-group">
              <label htmlFor="ten-percent">10% Discount:</label>
              <div className="input-with-suffix">
                <input
                  id="ten-percent"
                  type="number"
                  min="0"
                  value={loyaltySettings.tenPercent}
                  onChange={(e) => handleLoyaltySettingChange('tenPercent', e.target.value)}
                  className="loyalty-input"
                />
                <span className="input-suffix">points</span>
              </div>
            </div>

            <div className="loyalty-input-group">
              <label htmlFor="fifteen-percent">15% Discount:</label>
              <div className="input-with-suffix">
                <input
                  id="fifteen-percent"
                  type="number"
                  min="0"
                  value={loyaltySettings.fifteenPercent}
                  onChange={(e) => handleLoyaltySettingChange('fifteenPercent', e.target.value)}
                  className="loyalty-input"
                />
                <span className="input-suffix">points</span>
              </div>
            </div>

            <div className="loyalty-input-group">
              <label htmlFor="twenty-percent">20% Discount:</label>
              <div className="input-with-suffix">
                <input
                  id="twenty-percent"
                  type="number"
                  min="0"
                  value={loyaltySettings.twentyPercent}
                  onChange={(e) => handleLoyaltySettingChange('twentyPercent', e.target.value)}
                  className="loyalty-input"
                />
                <span className="input-suffix">points</span>
              </div>
            </div>

            <button 
              className="save-settings-btn"
              onClick={saveLoyaltySettings}
              disabled={isUpdatingSettings}
            >
              {isUpdatingSettings ? 'Saving...' : 'Save Settings'}
            </button>

            <div className="settings-preview">
              <h4>Current Loyalty Tiers:</h4>
              <ul>
                <li>{loyaltySettings.fivePercent}+ points → 5% discount</li>
                <li>{loyaltySettings.tenPercent}+ points → 10% discount</li>
                <li>{loyaltySettings.fifteenPercent}+ points → 15% discount</li>
                <li>{loyaltySettings.twentyPercent}+ points → 20% discount</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Side - Active Promotions */}
        <div className="promotions-section">
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
      </div>

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
    </div>
  );
};