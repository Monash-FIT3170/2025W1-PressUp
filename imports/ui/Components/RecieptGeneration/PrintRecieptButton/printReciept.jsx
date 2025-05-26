import React from "react";
import "./printReciept.css";

export const PrintReciept = ({
    order
}) => {
    var gross = 0;
    order.items.forEach(item => {
        gross += item.quantity*item.price;
    });
    var GST = gross/11;
    var total = gross;
    if (order.discount) {
        total -= order.discount;
    }
    var change = order.recievedPayment - total;
    function printReceiptFunction() {
        var str = "Order #" + order._id;
        str += "\n";
        str += "Table " + order.table;
        str += "\n\n";
        str += "Ordered Items:\n";
        order.items.forEach(item => {
            str += item.quantity + " " + item.menu_item + " ....................... $" + (item.quantity*item.price).toFixed(2) + "\n";
        })
        str += "\nsubtotal ....................... $" + gross.toFixed(2);
        str += "\nGST ....................... $" + GST.toFixed(2);
        if (order.discount) {
            str += "\ndiscount ....................... -$" + order.discount.toFixed(2);
        }
        str += "\ntotal ....................... $" + total.toFixed(2);
        str += "\nrecieved ....................... $" + order.recievedPayment.toFixed(2);
        str += "\nchange ....................... $" + change.toFixed(2);
        console.log(str);
    }
    return (
        <div className="button">
            <button
                className="text"
                onClick={printReceiptFunction}
            >Print Reciept</button>
        </div>
    )
}