import React, { useState } from "react";
import "./ChangeDetails.css";
import { PrintReciept } from "../RecieptGeneration/PrintRecieptButton/printReciept.jsx";

export const PrintRecieptSection = ({
    order,
    setCheckout
}) => {
    return (
      <div className="reciept-section">
        <img
          className="reciept-image"
          src="/images/recieptImage.png"
        />
        <PrintReciept order={order._id} setCheckout={setCheckout}/>
      </div>
    );
}