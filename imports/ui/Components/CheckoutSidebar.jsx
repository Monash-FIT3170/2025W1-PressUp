import React from "react";
import "./CheckoutSidebar.css";

export const CheckoutSidebar = ({ items, isOpen, toggleSidebar }) => {
  return (
    <>
      {/* Sidebar */}
      <div
        className={`sidebar-right ${isOpen ? "open" : ""}`}
        style={{ display: isOpen ? "block" : "none" }}
      >
        <div className="sidebar-header">
          <h3>Checkout</h3>
          <button className="close-btn" onClick={toggleSidebar}>
            Close
          </button>
        </div>
        <div className="sidebar-body">
          <ul>
            {items.map((item, index) => (
              <li key={index}>
                <span>{item.name}</span>
                <span> - ${item.price}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="sidebar-footer">
          <p>Total: ${items.reduce((acc, item) => acc + item.price, 0)}</p>
          <button className="checkout-btn">Checkout</button>
        </div>
      </div>

      {/* Main content (Add the content-shifted class when the sidebar is open) */}
      <div className={`main-content ${isOpen ? "content-shifted" : ""}`}></div>
    </>
  );
};
