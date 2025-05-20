import React from "react";
import { useSubscribe, useFind } from "meteor/react-meteor-data";
import "./orderSummary.css";
import { LoadingIndicator } from "../LoadingIndicator/LoadingIndicator.jsx";
import { OrdersCollection } from "../../../api/orders/orders-collection.js";

export const OrderSummary = ({
    orderID
}) => {
    const isLoading = useSubscribe("orders.id", orderID);
    var order = useFind(() => OrdersCollection.find({}), [orderID]);
    //if loading show loading indicator
    if (isLoading()) {
        return <LoadingIndicator />;
    }

    //if loaded but no order found indicate such
    if (!order || order.length === 0) {
        return (
        <div className="order-summary">
            invalid order number.
      </div>
        )
    } else {
        var gross = 0;
        order = order[0];
        console.log(order);
        order.items.forEach(item => {
            gross += item.quantity*item.price;
        });
        var GST = 0.1*gross;
        var total = gross + GST;
        if (order.discount) {
            total -= order.discount;
        }
        var change = order.paymentRecieved - total;
        var isPaidFor = change > 0;
    }
    //display order summary
    return (
      <div className="order-summary">
        <div className="top-section">
          <div className="order-number">{"Order " + orderID}</div>
          <div className="table-number">{"Table " + order.table + "."}</div>
        </div>
        <div className="middle-section">
          {order.items.map((item) => (
            <div className="order-item" key={item.menu_item}>
            <div className="order-item-name">
              {item.quantity + "x" + item.menu_item}
            </div>
            <div className="order-item-qty">
              {"$" + item.price}
            </div>
          </div>
          ))}
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
                {"$" + gross.toFixed(2)}
              </div>
            </div>
            <div className="detail-section">
            <div className="detail-name">
                GST 10%
            </div>
            <div className="detail-qty">
                {"$" + GST.toFixed(2)}
            </div>
            </div>
        </div>
        {order.discount ? (
            <div className="detail-section">
            <div className="detail-name">
                Discount
            </div>
            <div className="detail-qty">
                {"-$" + order.discount}
            </div>
            </div>
        ) : (<div className="detail-section">
            <div className="detail-name">
            Total
            </div>
            <div className="detail-qty">
            {"$" + total.toFixed(2)}
            </div>
        </div>)}
        {order.discount ? (
            <div className="detail-section">
            <div className="detail-name">
            Total
            </div>
            <div className="detail-qty">
            {"$" + total.toFixed(2)}
            </div>
        </div>) : (<div className="detail-section">
            <div className="detail-name">
            Received
            </div>
            <div className="detail-qty">
            {"$" + order.paymentRecieved.toFixed(2)}
            </div>
        </div>)
        }
        {order.discount ? (<div className="detail-section">
            <div className="detail-name">
            Received
            </div>
            <div className="detail-qty">
            {"$" + order.paymentRecieved.toFixed(2)}
            </div>
        </div>) : (isPaidFor ? (<div className="detail-section">
            <div className="detail-name">
            Change
            </div>
            <div className="detail-qty">
            {"$" + (order.paymentRecieved - total).toFixed(2)}
            </div>
        </div>) : (<div></div>))}
        
        </div>
    </div>
    );
}