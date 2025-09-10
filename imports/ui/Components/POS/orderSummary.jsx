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

  // split payment states
  const [remainingItems, setRemainingItems] = useState([]);
  const [showSplitModal, setShowSplitModal] = useState(false);

  const isLoading = useSubscribe("orders.id", orderID);
  let order = useFind(() => OrdersCollection.find({ _id: orderID }), [orderID]);

  // Flatten items for split payment whenever order data changes
  useEffect(() => {
    if (!order || !order[0]) return;

    const currentOrder = order[0];
    const flatItems = currentOrder.items.flatMap((item) =>
      Array.from({ length: item.quantity }, () => ({
        menu_item: item.menu_item,
        price: item.price,
        id: crypto?.randomUUID
          ? crypto.randomUUID()
          : Date.now() + Math.random(),
      }))
    );

    setRemainingItems(flatItems);
  }, [order]);

  // Reset modal & change info when a NEW orderID is selected
  useEffect(() => {
    setShowSplitModal(false);
    setShowChangeInfo(false);
  }, [orderID]);

  // Auto-update payment amount if method is card
  useEffect(() => {
    if (!order || !order[0]) return;
    const { total } = calculateOrderTotals(order[0]);
    if (paymentMethods === "cards") {
      setPaymentAmount(total);
    } else if (paymentMethods === "cash") {
      setPaymentAmount(0); // let user input manually
    }
  }, [paymentMethods, order]);

  function proceedButtonAction() {
    if (paymentMethods === "cards-failed") {
      alert(
        "❌ Payment failed. Please try again or use a different payment method."
      );
      return;
    }
    setShowChangeInfo(true);
  }

  if (isLoading()) return <LoadingIndicator />;
  if (!order || !order[0])
    return <div className="order-summary">invalid order number.</div>;

  const currentOrder = order[0];
  const { gross, GST, total } = calculateOrderTotals(currentOrder);

  // Show ChangeDetails / Payment page
  if (showChangeInfo) {
    return (
      <div className="order-summary-section">
        <OrderHeader order={currentOrder} />
        <OrderItems items={currentOrder.items} />
        <div className="bottom-section">
          <ChangeDetails
            order={currentOrder}
            orderID={currentOrder._id}
            setCheckout={setCheckout}
            paymentMethods={paymentMethods}
            paymentAmount={paymentAmount}
            setPaymentAmount={setPaymentAmount}
            totals={{ gross, GST, total }}
            onPaymentComplete={() => setCheckout(true)}
          />
        </div>
      </div>
    );
  }

  // Main Order Summary page
  return (
    <div className="order-summary-section">
      <OrderHeader order={currentOrder} />
      <OrderItems items={currentOrder.items} />

      <div className="bottom-section">
        <div className="summary-title">Summary</div>
        <div className="summary-details">
          <SummaryDetail name="Subtotal" value={"$" + gross.toFixed(2)} />
          <SummaryDetail name="GST 10%" value={"$" + GST.toFixed(2)} />
          {currentOrder.discount && (
            <SummaryDetail
              name="Discount"
              value={"-$" + currentOrder.discount}
            />
          )}
          <SummaryDetail name="Total" value={"$" + total.toFixed(2)} />
        </div>

        <PaymentMethods
          setPaymentMethods={setPaymentMethods}
          paymentMethods={paymentMethods}
        />

        {/* Split payment option */}
        <SplitPaymentButton setShowSplitModal={setShowSplitModal} />

        {showSplitModal && remainingItems.length > 0 && (
          <SplitPaymentModal
            remainingItems={remainingItems}
            setRemainingItems={setRemainingItems}
            setShowSplitModal={setShowSplitModal}
            onComplete={() => setShowChangeInfo(true)}
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
    <button
      onClick={() => setPaymentMethods("cards-failed")}
      className={`payment-btn ${
        paymentMethods === "cards-failed" ? "selected" : ""
      }`}
      id="destructive"
    >
      <CreditCard size={16} /> Cards (Failed)
    </button>
  </div>
);
