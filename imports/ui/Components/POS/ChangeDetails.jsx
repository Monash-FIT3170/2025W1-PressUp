import React, { useState } from "react";
import "./ChangeDetails.css";
import {PrintRecieptSection} from "./PrintRecieptSection.jsx"
import { Meteor } from 'meteor/meteor';

export const ChangeDetails = ({
    orderID,
    order
}) => {
    
    var gross = 0;
        order.items.forEach(item => {
            gross += item.quantity*item.price;
        });
        var total = gross;
        if (order.discount) {
            total -= order.discount;
        }
    const [payment,setPayment] = useState(0);
    const [change,setChange] = useState(0);
    const [paid,setPaid] = useState(false);
    function confirmButtonAction() {
        Meteor.call('orders.updatePayment', orderID,payment, (error, result) => {
            setPaid(true);
        });
    }
    const handlePaymentChange = (e) => {
        const value = e.target.value;
        // Allow blank input or valid numbers
        setPayment(value);
        if (value > total) {
            setChange(value-total);
        } else {
            setChange(0);
        }
      };

    if (paid) {
        return (
            <PrintRecieptSection order={order}/>
        )
    }
    return (
      <div className="change-details">
        <div className="qty-section">
          <div className="total-section">
            <div className="section-title">
              Total
            </div>
            <div className="section-qty">
              {"$"+total.toFixed(2)}
            </div>
          </div>
          <div className="self-stretch inline-flex justify-between items-center">
            <div className="section-title">
              Received
            </div>
            <input 
            id="payment-input"
            type="number"
            min={0}
            value={payment}
            onChange={handlePaymentChange}
            className="recieved-input"
          />
          </div>
          <div className="total-section">
            <div className="section-title">
              Change
            </div>
            <div className="section-qty">
              {"$"+change.toFixed(2)}
            </div>
          </div>
        </div>
        <div className="button-div">
        <button
                className="button"
                onClick={confirmButtonAction}
                disabled = {(payment - total) < 0}
            >Confirm</button>
        </div>
      </div>
    );
}