import React, { useState, useEffect } from "react";
import { useSubscribe, useFind } from "meteor/react-meteor-data";
import "./orderSummary.css";
import { LoadingIndicator } from "../LoadingIndicator/LoadingIndicator.jsx";
import { OrdersCollection } from "../../../api/orders/orders-collection";
import { ChangeDetails } from "./ChangeDetails.jsx";
import { Banknote, CreditCard } from "lucide-react";

// Utility function for order calculations
const calculateOrderTotals = (order) => {
  const gross = order.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );
  const GST = gross / 11;
  const total = order.discount ? gross - order.discount : gross;
  return { gross, GST, total };
};

// ------------------- MAIN COMPONENT -------------------
export const OrderSummary = ({ orderID, setCheckout }) => {
  const [paymentMethods, setPaymentMethods] = useState("cash");
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [showChangeInfo, setShowChangeInfo] = useState(false);

  // states for split payments
  const [remainingItems, setRemainingItems] = useState([]);
  const [showSplitModal, setShowSplitModal] = useState(false);

  const isLoading = useSubscribe("orders.id", orderID);
  var order = useFind(() => OrdersCollection.find({}), [orderID]);

  // when order loads, flatten items so each quantity is selectable individually
  useEffect(() => {
    if (order && order.length > 0) {
      const flatItems = order[0].items.flatMap((item) =>
        Array.from({ length: item.quantity }, () => ({
          menu_item: item.menu_item,
          price: item.price,
          id: crypto?.randomUUID ? crypto.randomUUID() : Date.now() + Math.random(),
        }))
      );
      setRemainingItems(flatItems);
    }
  }, [order]);

  // Update payment amount when payment method or order changes
  useEffect(() => {
    if (order && order.length > 0) {
      const { total } = calculateOrderTotals(order[0]);
      if (paymentMethods === "cards") {
        setPaymentAmount(total);
      } else if (paymentMethods === "cash") {
        setPaymentAmount(0);
      }
    }
  }, [paymentMethods, order]);

  const proceedButtonAction = () => {
    setShowChangeInfo(true);
  };

  if (isLoading()) {
    return <LoadingIndicator />;
  }

  if (!order || order.length === 0) {
    return <div className="order-summary">invalid order number.</div>;
  }

  order = order[0];
  const { gross, GST, total } = calculateOrderTotals(order);

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

        <SplitPayment setShowSplitModal={setShowSplitModal} />

        {showSplitModal && (
          <SplitPaymentModal
            remainingItems={remainingItems}
            setRemainingItems={setRemainingItems}
            setShowSplitModal={setShowSplitModal}
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

const SplitPayment = ({ setShowSplitModal }) => (
  <button
    onClick={() => setShowSplitModal(true)}
    className="split-payment-btn"
  >
    Split Payment
  </button>
);

const SplitPaymentModal = ({
  remainingItems,
  setRemainingItems,
  setShowSplitModal,
}) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [method, setMethod] = useState("cash");

  const toggleItem = (item) => {
    if (selectedItems.includes(item.id)) {
      setSelectedItems(selectedItems.filter((id) => id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item.id]);
    }
  };

  const selectedTotal = remainingItems
    .filter((item) => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + item.price, 0);

  const handleConfirm = () => {
    if (selectedItems.length === 0) return;

    const newRemaining = remainingItems.filter(
      (item) => !selectedItems.includes(item.id)
    );
    setRemainingItems(newRemaining);

    if (newRemaining.length === 0) {
      setShowSplitModal(false);
    }

    setSelectedItems([]);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Select items for this person</h3>
        <div className="items-list">
          {remainingItems.map((item) => (
            <div
              key={item.id}
              className={`item-row ${
                selectedItems.includes(item.id) ? "selected" : ""
              }`}
              onClick={() => toggleItem(item)}
            >
              <input
                type="checkbox"
                readOnly
                checked={selectedItems.includes(item.id)}
              />
              <span style={{ marginLeft: "8px" }}>
                1x {item.menu_item} - ${item.price.toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "10px", fontWeight: "500" }}>
          Selected total: ${selectedTotal.toFixed(2)}
        </div>

        <div className="payment-methods" style={{ marginTop: "10px" }}>
          <button
            className={method === "cash" ? "selected" : ""}
            onClick={() => setMethod("cash")}
          >
            <Banknote size={16} /> Cash
          </button>
          <button
            className={method === "cards" ? "selected" : ""}
            onClick={() => setMethod("cards")}
          >
            <CreditCard size={16} /> Card
          </button>
        </div>

        <button
          className="button"
          onClick={handleConfirm}
          style={{ marginTop: "12px" }}
        >
          Confirm Payment
        </button>
        <button
          className="button"
          onClick={() => setShowSplitModal(false)}
          style={{ marginTop: "6px", backgroundColor: "#eee" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
