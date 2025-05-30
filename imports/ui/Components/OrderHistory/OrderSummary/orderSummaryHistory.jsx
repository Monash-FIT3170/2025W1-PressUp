import React from "react";
import { useSubscribe, useFind } from "meteor/react-meteor-data";
import "./orderSummary.css";
import { LoadingIndicator } from "../OrderSummary/LoadingIndicator/LoadingIndicator.jsx";
import { OrdersCollection } from "../../../../api/orders/orders-collection";
import { PrintReciept } from "../../RecieptGeneration/PrintRecieptButton/printReciept.jsx";

export const OrderSummaryHistory = ({
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
        <div className="order-history-summary">
            invalid order number.
      </div>
        )
    } else {
        var gross = 0;
        order = order[0];
        order.items.forEach(item => {
            gross += item.quantity*item.price;
        });
        var GST = gross/11;
        var total = gross;
        if (order.discount) {
            total -= order.discount;
        }
        var change = order.recievedPayment - total;
        var isPaidFor = change > 0;
    }
    //display order summary
    return (
      <div className="order-history-summary">
        <div className="top-history-section">
          <div className="order-history-number">{"Order #" + orderID}</div>
          <div className="table-history-number">{"Table " + order.table + "."}</div>
        </div>
        <div className="middle-history-section">
          {order.items.map((item) => (
            <div className="order-history-item" key={item.menu_item}>
            <div className="order-history-item-name">
              {item.quantity + "x" + item.menu_item}
            </div>
            <div className="order-item-qty">
              {"$" + (item.price*item.quantity).toFixed(2)}
            </div>
          </div>
          ))}
        </div>
        <div className="bottom-history-section">
          <div className="summary-history-title">
            Summary
          </div>
          <div className="summary-history-details">
            <div className="detail-history-section">
              <div className="detail-history-name">
                Subtotal
              </div>
              <div className="detail-history-qty">
                {"$" + gross.toFixed(2)}
              </div>
            </div>
            <div className="detail-history-section">
            <div className="detail-history-name">
                GST 10%
            </div>
            <div className="detail-history-qty">
                {"$" + GST.toFixed(2)}
            </div>
            </div>
        </div>
        {order.discount ? (
            <div className="detail-history-section">
            <div className="detail-history-name">
                Discount
            </div>
            <div className="detail-history-qty">
                {"-$" + order.discount}
            </div>
            </div>
        ) : (<div className="detail-history-section">
            <div className="detail-history-name">
            Total
            </div>
            <div className="detail-history-qty">
            {"$" + total.toFixed(2)}
            </div>
        </div>)}
        {order.discount ? (
            <div className="detail-history-section">
            <div className="detail-history-name">
            Total
            </div>
            <div className="detail-history-qty">
            {"$" + total.toFixed(2)}
            </div>
        </div>) : (<div className="detail-history-section">
            <div className="detail-history-name">
            Received
            </div>
            <div className="detail-history-qty">
            {"$" + order.recievedPayment.toFixed(2)}
            </div>
        </div>)
        }
        {order.discount ? (<div className="detail-history-section">
            <div className="detail-history-name">
            Received
            </div>
            <div className="detail-history-qty">
            {"$" + order.recievedPayment.toFixed(2)}
            </div>
        </div>) : (isPaidFor ? (<div className="detail-history-section">
            <div className="detail-history-name">
            Change
            </div>
            <div className="detail-history-qty">
            {"$" + change.toFixed(2)}
            </div>
        </div>) : (<div></div>))}
        <PrintReciept order={order}/>
        </div>
    </div>
    );
}