import React from "react";
import "./printReciept.css";
import { useSubscribe, useFind } from "meteor/react-meteor-data";
import { LoadingIndicator } from "../../LoadingIndicator/LoadingIndicator.jsx";
import { OrdersCollection } from "../../../../api/orders/orders-collection";

export const PrintReciept = ({ orderID, setCheckout }) => {
  const isLoading = useSubscribe("orders.id", orderID);
  var order = useFind(() => OrdersCollection.find({}), [orderID]);
  if (isLoading()) {
    return <LoadingIndicator />;
  }
  order = order[0];
  var gross = 0;
  order.items.forEach((item) => {
    gross += item.quantity * item.price;
  });
  var GST = gross / 11;
  var total = gross;
  if (order.discount) {
    total -= order.discount;
  }
  var change = order.recievedPayment - total;
  var str = "Order #" + order._id;
  str += "\n";
  str += "Table " + order.table;
  str += "\n\n";
  str += "Ordered Items:\n";
  order.items.forEach((item) => {
    str +=
      item.quantity +
      " " +
      item.menu_item +
      " ....................... $" +
      (item.quantity * item.price).toFixed(2) +
      "\n";
  });

  str += "\npayment methods: ......................." + order.paymentMethods;
  str += "\nsubtotal ....................... $" + gross.toFixed(2);
  str += "\nGST ....................... $" + GST.toFixed(2);
  if (order.discount) {
    str +=
      "\ndiscount ....................... -$" +
      Number(order.discount).toFixed(2);
  }
  str += "\ntotal ....................... $" + total.toFixed(2);
  str +=
    "\nreceived ....................... $" +
    Number(order.recievedPayment).toFixed(2);
  str += "\nchange ....................... $" + change.toFixed(2);

  const file = new Blob([str], { type: "text/plain" });

  function printReceiptFunction() {
    console.log(str);
    if (setCheckout) {
      setCheckout(false);
    }
  }

  return (
    <a
      href={URL.createObjectURL(file)}
      className="link"
      download={order._id + ".txt"}
    >
      <div className="button-div">
        <button className="button" onClick={printReceiptFunction}>
          Print Reciept
        </button>
      </div>
    </a>
  );
};
