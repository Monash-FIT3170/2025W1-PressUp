import React, { useState, useEffect } from "react";
import { Banknote, CreditCard } from "lucide-react";

export const SplitPaymentButton = ({ setShowSplitModal }) => (
  <button
    onClick={() => setShowSplitModal(true)}
    className="split-payment-btn"
  >
    Split Payment
  </button>
);

export const SplitPaymentModal = ({
  remainingItems,
  setRemainingItems,
  setShowSplitModal,
  onComplete, // callback to trigger receipt
}) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [method, setMethod] = useState("cash");

  // Reset selection whenever remainingItems changes
  useEffect(() => {
    setSelectedItems([]);
  }, [remainingItems]);

  const toggleItem = (item) => {
    if (selectedItems.includes(item.id)) {
      setSelectedItems(selectedItems.filter((id) => id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item.id]);
    }
  };

  const selectedTotal = remainingItems
    .filter((item) => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + item.price, 0);

  const handleConfirm = () => {
    if (selectedItems.length === 0) return;

    const newRemaining = remainingItems.filter(
      (item) => !selectedItems.includes(item.id)
    );
    setRemainingItems(newRemaining);

    // If no items left, close modal and trigger receipt
    if (newRemaining.length === 0) {
      setShowSplitModal(false);
      if (onComplete) onComplete();
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Select items for this person</h3>

        {remainingItems.length === 0 ? (
          <div className="no-items">No items left to split.</div>
        ) : (
          <div className="items-list">
            {remainingItems.map((item) => (
              <div
                key={item.id}
                className={`item-row ${
                  selectedItems.includes(item.id) ? "selected" : ""
                }`}
                onClick={() => toggleItem(item)}
              >
                <input
                  type="checkbox"
                  readOnly
                  checked={selectedItems.includes(item.id)}
                />
                <span style={{ marginLeft: "8px" }}>
                  1x {item.menu_item} - ${item.price.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: "10px", fontWeight: "500" }}>
          Selected total: ${selectedTotal.toFixed(2)}
        </div>

        <div className="payment-methods" style={{ marginTop: "10px" }}>
          {/* <button
            className={`payment-btn ${method === "cash" ? "selected" : ""}`}
            onClick={() => setMethod("cash")}
          >
            <Banknote size={16} /> Cash
          </button> */}
          <button
            className={`payment-btn ${method === "cards" ? "selected" : ""}`}
            onClick={() => setMethod("cards")}
          >
            <CreditCard size={16} /> Card
          </button>
        </div>

        <button
          className="button"
          onClick={handleConfirm}
          style={{ marginTop: "12px" }}
        >
          Confirm Payment
        </button>
        <button
          className="button"
          onClick={() => setShowSplitModal(false)}
          style={{ marginTop: "6px", backgroundColor: "#eee" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
