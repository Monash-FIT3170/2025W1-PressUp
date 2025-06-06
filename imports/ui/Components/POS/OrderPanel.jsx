import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import './OrderPanel.css';
import '/imports/api/promotions/promotions-methods.js';

export const OrderPanel = ({ orderItems, removeFromOrder, updateQuantity, clearOrder , setCheckout, setCheckoutID}) => {
  // State for tracking table number and checkout status
  const [tableNumber, setTableNumber] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [discountedItems, setDiscountedItems] = useState({});
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState('');

  useEffect(() => {
    const fetchDiscounts = async () => {
      const updatedDiscounts = {};
  
      for (let i = 0; i < orderItems.length; i++) {
        const item = orderItems[i];
        const itemKey = item._id || i;

        try {
          const result = await Meteor.callAsync(
            'promotions.getDiscountedPrice',
            item.name || '',
            item.menuCategory || 'general',
            item.price,
            appliedPromoCode
          );

          updatedDiscounts[itemKey] = result || {
            finalPrice: item.price,
            discount: 0,
            appliedPromotion: null
          };
        } catch (err) {
          updatedDiscounts[itemKey] = {
            finalPrice: item.price,
            discount: 0,
            appliedPromotion: null
          };
        }
      }
  
      setDiscountedItems(updatedDiscounts);
    };
  
    fetchDiscounts();
  }, [orderItems, appliedPromoCode]);
  
  
  // Calculate subtotal
  const subtotal = orderItems.reduce((sum, item, index) => {
    const itemKey = item._id || index;
    const finalPrice = discountedItems[itemKey]?.finalPrice ?? item.price;
    return sum + finalPrice * item.quantity;
  }, 0);  
  
  // Function to handle table number changes
  const handleTableChange = (e) => {
    const value = e.target.value;
    // Allow blank input or valid numbers
    if (value === '' || /^[1-9][0-9]*$/.test(value)) {
      setTableNumber(value);
    }
  };

  // Function to handle checkout process
  const handleCheckout = () => {
    if (orderItems.length === 0) {
      setCheckoutError("Cannot checkout with an empty order");
      setTimeout(() => setCheckoutError(null), 3000);
      return;
    }

	if (!tableNumber) {
		setCheckoutError("Please enter a table number");
		setTimeout(() => 
      setCheckoutError(null), 3000);
		return;
	}

    setIsCheckingOut(true);
    
    // Format order data according to the schema
    console.log("Discounted Items:", discountedItems);

    const orderData = {
      table: tableNumber,
      status: "open",
      items: orderItems.map((item, index) => {
        const itemKey = item._id || index;
        const finalPrice = discountedItems[itemKey]?.finalPrice ?? item.price;
        return {
          menu_item: item.name,
          quantity: item.quantity,
          price: finalPrice,
        };
      }),
      createdAt: new Date(),
      recievedPayment: 0
    };

    console.log("Order Data being submitted:", orderData);
    
    // Call the Meteor method to insert the order
    Meteor.call('orders.insert', orderData, (error, result) => {
      setIsCheckingOut(false);
      
      if (error) {
        console.error("Error inserting order:", error);
        setCheckoutError("Failed to create order: " + error.message);
        setTimeout(() => setCheckoutError(null), 3000);
      } else {
        console.log("Order created successfully with ID:", result);
        setCheckoutSuccess(true);
        setCheckoutID(result);
        setCheckout(true);
        // Reset checkout success message after delay and clear the order
        setTimeout(() => {
          if (clearOrder) clearOrder();
        }, 2000);
      }
    });
  };
  
  return (
    <div className="order-panel">
      <div className="order-panel-header">
        <div className="table-selector">
          <label htmlFor="table-number"><h3>Table #:</h3></label>
          <input 
            id="table-number"
            type="number" 
            min="1"
            value={tableNumber}
            onChange={handleTableChange}
            className="table-number-input"
            placeholder="-"
          />
        </div>
      </div>
      
      <div className="order-items-container">
        {orderItems.length === 0 ? (
          <p className="empty-order">No items added</p>
        ) : (
          orderItems.map((item, index) => (
            <div key={`${item._id || index}`} className="order-item">
              <div className="order-item-info">
                <h3>{item.name}</h3>
                <div className="quantity-controls">
                  <button 
                    className="quantity-btn" 
                    onClick={() => updateQuantity(item._id || index, Math.max(1, item.quantity - 1))}
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button 
                    className="quantity-btn"
                    onClick={() => updateQuantity(item._id || index, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="order-item-price">
              <>
                {discountedItems[item._id || index]?.discount > 0 ? (
                  <>
                    <span className="line-through">${(item.price * item.quantity).toFixed(2)}</span>{' '}
                    <span className="discounted-price">
                      ${(discountedItems[item._id || index]?.finalPrice * item.quantity).toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                )}
              </>
                <button 
                  className="remove-btn"
                  onClick={() => removeFromOrder(item._id || index)}
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="order-summary">
        {checkoutError && (
          <div className="checkout-error">{checkoutError}</div>
        )}
        
        {checkoutSuccess && (
          <div className="checkout-success">Order placed successfully!</div>
        )}

        <div className="promo-code-section">
          <label htmlFor="promo-code">Promo Code:</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              id="promo-code"
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Enter promo code"
              className="promo-code-input"
            />
            <button
              onClick={() => setAppliedPromoCode(promoCode)}
              className="apply-promo-btn"
            >
              Apply
            </button>
          </div>
          {appliedPromoCode && (
            <div className="applied-promo-msg">
              Applied code: <strong>{appliedPromoCode}</strong>
            </div>
          )}
        </div>
        
        <div className="subtotal">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <button 
          className={`checkout-btn ${isCheckingOut ? 'checking-out' : ''}`}
          onClick={handleCheckout}
          disabled={isCheckingOut}
        >
          {isCheckingOut ? 'Processing...' : 'Check out'}
        </button>
      </div>
    </div>
  );
};