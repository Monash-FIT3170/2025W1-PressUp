import React , {useState}   from "react";
import { useSubscribe, useFind } from "meteor/react-meteor-data";
import "./orderSummary.css";
import { LoadingIndicator } from "../LoadingIndicator/LoadingIndicator.jsx";
import { OrdersCollection } from "../../../api/orders/orders-collection";
import { PrintReciept } from "../RecieptGeneration/PrintRecieptButton/printReciept.jsx";
import { ChangeDetails } from "./ChangeDetails.jsx";

export const OrderSummary = ({
    orderID,
    setCheckout
}) => {
  
    const [showChangeInfo,setShowChangeInfo] = useState(false);
    const isLoading = useSubscribe("orders.id", orderID);
    var order = useFind(() => OrdersCollection.find({}), [orderID]);
    
    function proceedButtonAction() {
      setShowChangeInfo(true);
    }
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
    //show change info section after proceeding
    if (showChangeInfo) {
      return (
        <div className="order-summary-section">
          <div className="top-section">
            <div className="order-number">Your Order</div>
            <div className="table-number">{"Table " + order.table + "."}</div>
          </div>
          <div className="middle-section">
            {order.items.map((item) => (
              <div className="order-item" key={item.menu_item}>
              <div className="order-item-name">
                {item.quantity + "x" + item.menu_item}
              </div>
              <div className="order-item-qty">
                {"$" + (item.price*item.quantity).toFixed(2)}
              </div>
            </div>
            ))}
          </div>
          <div className="bottom-section">
            <ChangeDetails order = {order} orderID= {order._id} setCheckout={setCheckout}/>
          </div>
      </div>
      );
    }
    //display order summary
    return (
      <div className="order-summary-section">
        <div className="top-section">
          <div className="order-number">Your Order</div>
          <div className="table-number">{"Table " + order.table + "."}</div>
        </div>
        <div className="middle-section">
          {order.items.map((item) => (
            <div className="order-item" key={item.menu_item}>
            <div className="order-item-name">
              {item.quantity + "x" + item.menu_item}
            </div>
            <div className="order-item-qty">
              {"$" + (item.price*item.quantity).toFixed(2)}
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
        </div>) : (<></>)
        }
        <div className="button-div">
            <button
                className="button"
                onClick={proceedButtonAction}
            >Proceed</button>
        </div>
        </div>
    </div>
    );
}