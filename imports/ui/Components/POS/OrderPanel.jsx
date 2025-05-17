import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import './OrderPanel.css';

export const OrderPanel = ({ orderItems, removeFromOrder, updateQuantity, clearOrder }) => {
  // State for tracking table number and checkout status
  const [tableNumber, setTableNumber] = useState(1);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  
  // Calculate subtotal
  const subtotal = orderItems.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  
  // Function to handle table number changes
  const handleTableChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
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

    setIsCheckingOut(true);
    
    // Format order data according to the schema
    const orderData = {
      table: tableNumber,
      status: "open",
      items: orderItems.map(item => ({
        menu_item: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      createdAt: new Date()
    };
    
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
        
        // Reset checkout success message after delay and clear the order
        setTimeout(() => {
          setCheckoutSuccess(false);
          if (clearOrder) clearOrder();
        }, 2000);
      }
    });
  };
  
  return (
    <div className="order-panel">
      <div className="order-panel-header">
        <div className="table-selector">
          <label htmlFor="table-number">Order Table</label>
          <input 
            id="table-number"
            type="number" 
            min="1"
            value={tableNumber}
            onChange={handleTableChange}
            className="table-number-input"
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
                <span>${(item.price * item.quantity).toFixed(2)}</span>
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