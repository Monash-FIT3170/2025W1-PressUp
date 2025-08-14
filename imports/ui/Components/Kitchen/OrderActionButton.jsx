// imports/ui/components/OrderActionButton.jsx
import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import ConfirmDialog from './ConfirmDialog.jsx';
import './OrderActionButton.css';

const OrderActionButton = ({ orderId, methodName, label, className }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirm = () => {
    setShowConfirm(false);
    Meteor.call(methodName, orderId, (err) => {
      if (err) {
        alert(`Error: ${err.message}`);
      }
    });
  };

  return (
    <>
      <button
        className={`order-action-btn ${className}`}
        onClick={() => setShowConfirm(true)}
      >
        {label}
      </button>

      {showConfirm && (
        <ConfirmDialog
          message={`Are you sure you want to ${label.toLowerCase()}?`}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
};

export default OrderActionButton;
