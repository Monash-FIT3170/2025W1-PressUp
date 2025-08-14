import React, { useState, useEffect } from "react";
import { Meteor } from "meteor/meteor";
import "./OrderPanel.css";
import "/imports/api/promotions/promotions-methods.js";
import { useTracker } from "meteor/react-meteor-data";
import { InventoryCollection } from "/imports/api/inventory/inventory-collection.js";
import { TablesCollection } from "../../../api/tables/TablesCollection";
import { CustomersCollection } from "/imports/api/customers/customers-collection.js";

export const OrderPanel = ({
  orderItems,
  removeFromOrder,
  updateQuantity,
  clearOrder,
  setCheckout,
  setCheckoutID,
}) => {
  // State for tracking table number and checkout status
  const [tableNumber, setTableNumber] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [discountedItems, setDiscountedItems] = useState({});
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromoCode, setAppliedPromoCode] = useState("");
  
  // Customer lookup state
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const inventoryItems = useTracker(() => {
    const handle = Meteor.subscribe("inventory.all");
    if (!handle.ready()) {
      return []; // wait until subscription is ready
    }
    return InventoryCollection.find().fetch();
  }, []);

  const availableTables = useTracker(() => {
    const handle = Meteor.subscribe("tables.all");

    if (!handle.ready()) return [];

    return TablesCollection.find({
      table_status: { $eq: "available" },
    }).fetch();
  }, []);

  // Customer search subscription
  const matchingCustomers = useTracker(() => {
    if (!customerPhone || customerPhone.trim() === "") {
      return [];
    }

    const handle = Meteor.subscribe("customers.searchByPhone", customerPhone.trim());
    
    if (!handle.ready()) {
      return [];
    }

    return CustomersCollection.find({
      phone: { $regex: new RegExp(customerPhone.replace(/\D/g, ''), 'i') }
    }).fetch();
  }, [customerPhone]);

  const inventoryMap = {};
  inventoryItems.forEach((invItem) => {
    inventoryMap[invItem._id] = invItem;
  });

  useEffect(() => {
    const fetchDiscounts = async () => {
      const updatedDiscounts = {};

      for (let i = 0; i < orderItems.length; i++) {
        const item = orderItems[i];
        const itemKey = item._id || i;

        try {
          const result = await Meteor.callAsync(
            "promotions.getDiscountedPrice",
            item.name || "",
            item.menuCategory || "general",
            item.price,
            appliedPromoCode
          );

          updatedDiscounts[itemKey] = result || {
            finalPrice: item.price,
            discount: 0,
            appliedPromotion: null,
          };
        } catch (err) {
          updatedDiscounts[itemKey] = {
            finalPrice: item.price,
            discount: 0,
            appliedPromotion: null,
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
    if (value === "" || /^[1-9][0-9]*$/.test(value)) {
      setTableNumber(value);
    }
  };

  // Function to handle customer phone input
  const handleCustomerPhoneChange = (e) => {
    const value = e.target.value;
    setCustomerPhone(value);
    setShowCustomerDropdown(value.length > 0);
    
    // Clear selected customer if phone is modified
    if (selectedCustomer && value !== selectedCustomer.phone) {
      setSelectedCustomer(null);
    }
  };

  // Function to select a customer from dropdown
  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setCustomerPhone(customer.phone);
    setShowCustomerDropdown(false);
  };

  // Function to clear customer selection
  const clearCustomerSelection = () => {
    setSelectedCustomer(null);
    setCustomerPhone("");
    setShowCustomerDropdown(false);
  };

  // Function to handle checkout process
  const handleCheckout = async () => {
    if (orderItems.length === 0) {
      setCheckoutError("Cannot checkout with an empty order");
      setTimeout(() => setCheckoutError(null), 3000);
      return;
    }

    if (!tableNumber) {
      setCheckoutError("Please enter a table number");
      setTimeout(() => setCheckoutError(null), 3000);
      return;
    }

    setIsCheckingOut(true);

    // Format order data according to the schema
    console.log("Discounted Items:", discountedItems);

    const orderData = {
      table: tableNumber,
      status: "open",
      customer: selectedCustomer ? selectedCustomer._id : null, // Add customer reference
      customerInfo: selectedCustomer ? {
        name: selectedCustomer.name,
        phone: selectedCustomer.phone,
        email: selectedCustomer.email
      } : null,
      items: orderItems.map((item, index) => {
        const itemKey = item._id || index;
        const finalPrice = discountedItems[itemKey]?.finalPrice ?? item.price;

        const ingredients = item.ingredients || [];
        const fullIngredientData = ingredients
          .map((ingred) => {
            const inventoryItem = inventoryMap[ingred.id];
            return inventoryItem
              ? { ...inventoryItem, amount: ingred.amount }
              : null;
          })
          .filter(Boolean);

        const finalCost = fullIngredientData.reduce((total, ingredient) => {
          return total + (ingredient.price || 0) * ingredient.amount;
        }, 0);

        return {
          menu_item: item.name,
          quantity: item.quantity,
          price: finalPrice,
          cost: finalCost,
        };
      }),
      createdAt: new Date(),
      recievedPayment: 0,
    };

    console.log("Order Data being submitted:", orderData);

    try {
      await Meteor.callAsync(
        "tables.updateStatus",
        parseInt(tableNumber),
        "checked-in"
      );
    } catch (error) {
      console.error("Error updating table status:", error);
      setCheckoutError("Failed to update table status: " + error.message);
      setIsCheckingOut(false);
      return;
    }

    // Call the Meteor method to insert the order
    Meteor.call("orders.insert", orderData, (error, result) => {
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
          // Also clear customer selection after successful checkout
          clearCustomerSelection();
        }, 2000);
      }
    });
  };

  return (
    <div className="order-panel">
      <div className="order-panel-header">
        <div className="table-selector">
          <label htmlFor="table-number">
            <h3>Table #:</h3>
          </label>
          <select
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
          >
            <option>-</option>
            {availableTables.map((table) => (
              <option key={table.table_number} value={table.table_number}>
                {table.table_number}
              </option>
            ))}
          </select>
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
                    onClick={() =>
                      updateQuantity(
                        item._id || index,
                        Math.max(1, item.quantity - 1)
                      )
                    }
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button
                    className="quantity-btn"
                    onClick={() =>
                      updateQuantity(item._id || index, item.quantity + 1)
                    }
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="order-item-price">
                <>
                  {discountedItems[item._id || index]?.discount > 0 ? (
                    <>
                      <span className="line-through">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>{" "}
                      <span className="discounted-price">
                        $
                        {(
                          discountedItems[item._id || index]?.finalPrice *
                          item.quantity
                        ).toFixed(2)}
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
        {checkoutError && <div className="checkout-error">{checkoutError}</div>}

        {checkoutSuccess && (
          <div className="checkout-success">Order placed successfully!</div>
        )}

        <div className="promo-code-section">
          <label htmlFor="promo-code">Promo Code:</label>
          <div style={{ display: "flex", gap: "8px" }}>
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

        {/* Customer lookup section */}
        <div className="customer-lookup">
          <label htmlFor="customer-phone">Customer Phone:</label>
          <div className="customer-input-container" style={{ position: 'relative' }}>
            <input
              id="customer-phone"
              type="text"
              value={customerPhone}
              onChange={handleCustomerPhoneChange}
              placeholder="Enter phone number"
              className="customer-phone-input"
            />
            {selectedCustomer && (
              <button
                type="button"
                onClick={clearCustomerSelection}
                className="clear-customer-btn"
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            )}
            
            {/* Customer dropdown */}
            {showCustomerDropdown && matchingCustomers.length > 0 && (
              <div className="customer-dropdown" style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderTop: 'none',
                maxHeight: '200px',
                overflowY: 'auto',
                zIndex: 1000,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                {matchingCustomers.map((customer) => (
                  <div
                    key={customer._id}
                    className="customer-option"
                    onClick={() => handleCustomerSelect(customer)}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #eee',
                      backgroundColor: selectedCustomer?._id === customer._id ? '#f0f0f0' : 'white'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = selectedCustomer?._id === customer._id ? '#f0f0f0' : 'white'
                    }}
                  >
                    <div style={{ fontWeight: 'bold' }}>{customer.name}</div>
                    <div style={{ fontSize: '0.9em', color: '#666' }}>
                      {customer.phone}
                      {customer.email && ` • ${customer.email}`}
                      {customer.loyaltyPoints > 0 && ` • ${customer.loyaltyPoints} pts`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Selected customer display */}
          {selectedCustomer && (
            <div className="selected-customer" style={{
              marginTop: '8px',
              padding: '8px',
              backgroundColor: '#e8f5e8',
              border: '1px solid #4caf50',
              borderRadius: '4px',
              fontSize: '0.9em'
            }}>
              <strong>Selected:</strong> {selectedCustomer.name}
              {selectedCustomer.loyaltyPoints > 0 && (
                <span style={{ marginLeft: '8px', color: '#2e7d32' }}>
                  ({selectedCustomer.loyaltyPoints} loyalty points)
                </span>
              )}
            </div>
          )}
        </div>

        <div className="subtotal">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <button
          className={`checkout-btn ${isCheckingOut ? "checking-out" : ""}`}
          onClick={handleCheckout}
          disabled={isCheckingOut}
        >
          {isCheckingOut ? "Processing..." : "Check out"}
        </button>
      </div>
    </div>
  );
};