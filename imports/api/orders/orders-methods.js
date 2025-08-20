import { Meteor } from "meteor/meteor";
import { OrdersCollection } from "./orders-collection";

Meteor.methods({
  async "orders.insert"(order) {
    return await OrdersCollection.insertAsync(order);
  },

  async "orders.updatePayment"(id, paymentAmount, paymentMethods) {
    return await OrdersCollection.updateAsync(
      { _id: id },
      { $set: { recievedPayment: paymentAmount, paymentMethods } }
    );
  },

  async "orders.remove"(id) {
    return await OrdersCollection.removeAsync({ _id: id });
  },
});
