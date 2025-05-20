import React from "react";
import { useSubscribe, useFind } from "meteor/react-meteor-data";
import "./orderSummary.css";
import { LoadingIndicator } from "../LoadingIndicator/LoadingIndicator.jsx";
import { OrdersCollection } from "../../../api/orders/orders-collection.js";

export const orderSummaryPage = ({
    orderID
}) => {
    const isLoading = useSubscribe("orders.id", orderID);
    const order = useFind(() => OrdersCollection.find({}), [orderID]);

    //if loading show loading indicator
    //if (isLoading()) {
        //return <LoadingIndicator />;
    //}

    //if loaded but no order found indicate such
    //if (!order || order.length === 0) {
        //return (
        //<div className="order-summary">
            //invalid order number.
      //</div>
        //)
    //}
    //display order summary
    return (
      <div className="order-summary">
        <div className="top-section">
          <div className="order-number">Order #4</div>
          <div className="table-number">Table 4.</div>
        </div>
        <div className="middle-section">
          <div className="order-item">
            <div className="order-item-name">
              1 x Espresso
            </div>
            <div className="order-item-qty">
              $4.20
            </div>
          </div>
        </div>
        <div className="bottom-section">
          <div className="summary-title">
            Summary
          </div>
          <div className="summary-details">
            <div className="detail-section">
              <div className="detail-name">
                Subtotal
              </div>
              <div className="detail-qty">
                $8.20
              </div>
            </div>
            <div className="self-stretch flex flex-col justify-start items-start gap-[5px]">
              <div className="detail-section">
                <div className="detail-name">
                  GST 10%
                </div>
                <div className="detail-qty">
                  $0.82
                </div>
              </div>
            </div>
            <div className="detail-section">
              <div className="detail-name">
                Discount
              </div>
              <div className="detail-qty">
                -$2.00
              </div>
            </div>
            <div className="detail-section">
              <div className="detail-name">
                Total
              </div>
              <div className="detail-qty">
                $6.20
              </div>
            </div>
            <div className="detail-section">
              <div className="detail-name">
                Received
              </div>
              <div className="detail-qty">
                $10.00
              </div>
            </div>
            <div className="detail-section">
              <div className="detail-name">
                Change
              </div>
              <div className="detail-qty">
                $3.80
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}