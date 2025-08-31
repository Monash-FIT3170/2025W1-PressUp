import React, { useState, useEffect } from "react";
import { useSubscribe, useFind } from "meteor/react-meteor-data";
import "./orderSummary.css";
import { LoadingIndicator } from "../LoadingIndicator/LoadingIndicator.jsx";
import { OrdersCollection } from "../../../api/orders/orders-collection";
import { ChangeDetails } from "./ChangeDetails.jsx";
import { Banknote, CreditCard } from "lucide-react";
import { SplitPaymentButton, SplitPaymentModal } from "./SplitPayment.jsx";

// Utility function to calculate totals
const calculateOrderTotals = (order) => {
  const gross = order.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );
  const GST = gross / 11;
  const total = order.discount ? gross - order.discount : gross;
  return { gross, GST, total };
};

export const OrderSummary = ({ orderID, setCheckout }) => {
  const [paymentMethods, setPaymentMethods] = useState("cash");
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [showChangeInfo, setShowChangeInfo] = useState(false);

  const [remainingItems, setRemainingItems] = useState([]);
  const [showSplitModal, setShowSplitModal] = useState(false);

  const isLoading = useSubscribe("orders.id", orderID);
  let order = useFind(() => OrdersCollection.find({}), [orderID]);

  // Flatten items for split payment whenever orderID changes
  useEffect(() => {
    if (!orderID) return;
  
    // Fetch the latest order from the collection
    const foundOrders = OrdersCollection.find({ _id: orderID }).fetch();
    if (foundOrders.length === 0) {
      setRemainingItems([]);
      setShowSplitModal(false);
      setShowChangeInfo(false);
      return;
    }
  
    const currentOrder = foundOrders[0];
  
    // Flatten items for split payment
    const flatItems = currentOrder.items.flatMap((item) =>
      Array.from({ length: item.quantity }, () => ({
        menu_item: item.menu_item,
        price: item.price,
        id: crypto?.randomUUID
          ? crypto.randomUUID()
          : Date.now() + Math.random(),
      }))
    );
  
    // Reset split payment state for new order
    setRemainingItems(flatItems);
    setShowSplitModal(false);
    setShowChangeInfo(false);
  
  }, [orderID]);
  
  // Auto-update payment amount if method is card
  useEffect(() => {
    if (order && order.length > 0) {
      const { total } = calculateOrderTotals(order[0]);
      setPaymentAmount(paymentMethods === "cards" ? total : 0);
    }
  }, [paymentMethods, order]);

  const proceedButtonAction = () => setShowChangeInfo(true);

  if (isLoading()) return <LoadingIndicator />;
  if (!order || order.length === 0)
    return <div className="order-summary">invalid order number.</div>;

  order = order[0];
  const { gross, GST, total } = calculateOrderTotals(order);

  // Show receipt / change details page
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

  // Main order summary page
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

        <SplitPaymentButton setShowSplitModal={setShowSplitModal} />

        {showSplitModal && (
          <SplitPaymentModal
            remainingItems={remainingItems}
            setRemainingItems={setRemainingItems}
            setShowSplitModal={setShowSplitModal}
            onComplete={() => setShowChangeInfo(true)} // always go to receipt
          />
        )}

        <button className="button" onClick={proceedButtonAction}>
          Proceed
        </button>
      </div>
    </div>
  );
};

// ------------------- SUB COMPONENTS -------------------

const OrderHeader = ({ order }) => (
  <div className="top-section">
    <div className="order-number">Your Order</div>
    <div className="table-number">{"Table " + order.table + "."}</div>
  </div>
);

const OrderItem = ({ item }) => (
  <div className="order-item">
    <div className="order-item-name">
      {item.quantity + "x " + item.menu_item}
    </div>
    <div className="order-item-qty">
      {"$" + (item.price * item.quantity).toFixed(2)}
    </div>
  </div>
);

const OrderItems = ({ items }) => (
  <div className="middle-section">
    {items.map((item, idx) => (
      <OrderItem key={idx} item={item} />
    ))}
  </div>
);

const SummaryDetail = ({ name, value }) => (
  <div className="detail-section">
    <div className="detail-name">{name}</div>
    <div className="detail-qty">{value}</div>
  </div>
);

const PaymentMethods = ({ setPaymentMethods, paymentMethods }) => (
  <div className="payment-methods">
    <button
      onClick={() => setPaymentMethods("cash")}
      className={`payment-btn ${paymentMethods === "cash" ? "selected" : ""}`}
    >
      <Banknote size={16} /> Cash
    </button>
    <button
      onClick={() => setPaymentMethods("cards")}
      className={`payment-btn ${paymentMethods === "cards" ? "selected" : ""}`}
    >
      <CreditCard size={16} /> Cards
    </button>
  </div>
);
