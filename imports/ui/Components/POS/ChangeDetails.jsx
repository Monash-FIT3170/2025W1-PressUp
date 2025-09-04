import React, { useState, useEffect } from "react";
import "./ChangeDetails.css";
import { PrintRecieptSection } from "./PrintRecieptSection.jsx";
import { Meteor } from "meteor/meteor";

const PaymentSection = ({ title, children }) => (
  <div className="payment-section">
    <div className="section-title">{title}</div>
    {children}
  </div>
);

const PaymentInput = ({ value, onChange, total, paymentMethods }) => {
  if (paymentMethods === "cash") {
    return (
      <input
        id="payment-input"
        type="number"
        min={0}
        value={value}
        onChange={onChange}
        className="received-input"
      />
    );
  }

  return <span>{"$" + total.toFixed(2)}</span>;
};

export const ChangeDetails = ({
  orderID,
  order,
  setCheckout,
  paymentMethods,
  paymentAmount,
  setPaymentAmount,
  totals,
}) => {
  const { total } = totals;
  const [change, setChange] = useState(0);
  const [paid, setPaid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (paymentMethods === "cards") {
      setPaymentAmount(total);
    }
  }, [paymentMethods, setPaymentAmount]);

  // Calculate change when payment amount changes
  useEffect(() => {
    if (paymentAmount > total) {
      setChange(paymentAmount - total);
    } else {
      setChange(0);
    }
  }, [paymentAmount, total]);

  const simulateCardPaymentFailure = () => {
    // Generate random number between 0-99, fail if < 1 (1% chance)
    return Math.floor(Math.random() * 100) < 1;
  };

  function confirmButtonAction() {
    setIsProcessing(true);

    // For card payments, simulate 1% failure rate
    if (paymentMethods === "cards" && simulateCardPaymentFailure()) {
      setTimeout(() => {
        alert(
          "❌ Payment failed. Please try again or use a different payment method."
        );
        setIsProcessing(false);
      }, 1500); // Simulate processing delay
      return;
    }

    Meteor.call(
      "orders.updatePayment",
      orderID,
      paymentAmount,
      paymentMethods,
      () => {
        setIsProcessing(false);
        setPaid(true);
      }
    );
  }

  const handlePaymentChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setPaymentAmount(value);
  };

  if (paid) {
    return <PrintRecieptSection order={order} setCheckout={setCheckout} />;
  }
  return (
    <div className="change-details">
      <div className="qty-section">
        <PaymentSection title="Total">
          <div className="section-qty">{"$" + total.toFixed(2)}</div>
        </PaymentSection>

        <PaymentSection title="Received">
          <PaymentInput
            value={paymentAmount}
            onChange={handlePaymentChange}
            total={total}
            paymentMethods={paymentMethods}
          />
        </PaymentSection>

        <PaymentSection title="Change">
          <div className="section-qty">{"$" + change.toFixed(2)}</div>
        </PaymentSection>
      </div>
      <button
        className="button"
        onClick={confirmButtonAction}
        disabled={paymentAmount - total < 0 || isProcessing}
      >
        {isProcessing ? "Processing..." : "Confirm"}
      </button>
    </div>
  );
};
