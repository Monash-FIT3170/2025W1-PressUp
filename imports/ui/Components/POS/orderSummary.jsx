import React, { useState, useEffect } from "react";
import { useSubscribe, useFind } from "meteor/react-meteor-data";
import "./orderSummary.css";
import { LoadingIndicator } from "../LoadingIndicator/LoadingIndicator.jsx";
import { OrdersCollection } from "../../../api/orders/orders-collection";
import { PrintReciept } from "../RecieptGeneration/PrintRecieptButton/printReciept.jsx";
import { ChangeDetails } from "./ChangeDetails.jsx";
import { Banknote, CreditCard } from "lucide-react";

// Utility function for order calculations
const calculateOrderTotals = (order) => {
  const gross = order.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const GST = gross / 11;
  const total = order.discount ? gross - order.discount : gross;
  return { gross, GST, total };
};

// Reusable components
const OrderHeader = ({ order }) => (
  <div className="top-section">
    <div className="order-number">Your Order</div>
    <div className="table-number">{"Table " + order.table + "."}</div>
  </div>
);

const OrderItem = ({ item }) => (
  <div className="order-item" key={item.menu_item}>
    <div className="order-item-name">
      {item.quantity + "x" + item.menu_item}
    </div>
    <div className="order-item-qty">
      {"$" + (item.price * item.quantity).toFixed(2)}
    </div>
  </div>
);

const OrderItems = ({ items }) => (
  <div className="middle-section">
    {items.map((item) => (
      <OrderItem key={item.menu_item} item={item} />
    ))}
  </div>
);

const SummaryDetail = ({ name, value }) => (
  <div className="detail-section">
    <div className="detail-name">{name}</div>
    <div className="detail-qty">{value}</div>
  </div>
);

export const OrderSummary = ({ orderID, setCheckout }) => {
  const [paymentMethods, setPaymentMethods] = useState("cash");
  const [splittingPayment, setSplitPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [showChangeInfo, setShowChangeInfo] = useState(false);
  const isLoading = useSubscribe("orders.id", orderID);
  var order = useFind(() => OrdersCollection.find({}), [orderID]);

  // Update payment amount when payment method or order changes
  useEffect(() => {
    if (order && order.length > 0) {
      const { total } = calculateOrderTotals(order[0]);
      if (paymentMethods === "cards") {
        setPaymentAmount(total);
      } else if (paymentMethods === "cash") {
        setPaymentAmount(0); // Reset to user input for cash
      }
    }
  }, [paymentMethods, order]);

  function splitPaymentAction() {

  }
  function proceedButtonAction() {
    setShowChangeInfo(true);
  }
  //if loading show loading indicator
  if (isLoading()) {
    return <LoadingIndicator />;
  }

  //if loaded but no order found indicate such
  if (!order || order.length === 0) {
    return <div className="order-summary">invalid order number.</div>;
  }
  
  order = order[0];
  const { gross, GST, total } = calculateOrderTotals(order);
  //show change info section after proceeding
  if (showChangeInfo) {
    return (
      <div className="order-summary-section">
        <OrderHeader order={order} />
        <OrderItems items={order.items} />
        <div className="bottom-section">
          <ChangeDetails
            order={order}
            orderID={order._id}
            setCheckout={setCheckout}
            paymentMethods={paymentMethods}
            paymentAmount={paymentAmount}
            setPaymentAmount={setPaymentAmount}
            totals={{ gross, GST, total }}
          />
        </div>
      </div>
    );
  }
  //display order summary
  return (
    <div className="order-summary-section">
      <OrderHeader order={order} />
      <OrderItems items={order.items} />
      <div className="bottom-section">
        <div className="summary-title">Summary</div>
        <div className="summary-details">
          <SummaryDetail name="Subtotal" value={"$" + gross.toFixed(2)} />
          <SummaryDetail name="GST 10%" value={"$" + GST.toFixed(2)} />
        </div>
        {order.discount && (
          <SummaryDetail name="Discount" value={"-$" + order.discount} />
        )}
        <SummaryDetail name="Total" value={"$" + total.toFixed(2)} />
        <PaymentMethods
          setPaymentMethods={setPaymentMethods}
          paymentMethods={paymentMethods}
        />
        <SplitPayment
          setSplitPayment={setSplitPayment}
          splittingPayment={splittingPayment}
        />
        <button className="button" onClick={proceedButtonAction}>
          Proceed
        </button>
      </div>
    </div>
  );
};

const PaymentMethods = ({ setPaymentMethods, paymentMethods }) => {
  return (
    <div className="payment-methods">
      <button
        onClick={() => setPaymentMethods("cash")}
        className={`payment-btn ${paymentMethods === "cash" ? "selected" : ""}`}
      >
        <Banknote size={16} />
        <span>Cash</span>
      </button>
      <button
        onClick={() => setPaymentMethods("cards")}
        className={`payment-btn ${
          paymentMethods === "cards" ? "selected" : ""
        }`}
      >
        <CreditCard size={16} />
        <span>Cards</span>
      </button>
    </div>
  );
};

const SplitPayment = ({setSplitPayment, splittingPayment}) => {
  return (
    <button  
      onClick={() => setSplitPayment(true)}
      className={`split-payment-btn ${splittingPayment === true ? "selected" : ""}`}
      >
        Split Payment
    </button>
  );
};
