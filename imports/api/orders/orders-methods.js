import { Meteor } from "meteor/meteor";
import { OrdersCollection } from "./orders-collection";
import { check, Match } from 'meteor/check';

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
    
    async 'orders.markClosed'(id) {
        return await OrdersCollection.updateAsync(
            { _id: id },
            { $set: { status: "closed" } }
        );
    },

    async 'orders.markCancelled'(id) {
        return await OrdersCollection.updateAsync(
            { _id: id },
            { $set: { status: "cancelled" } }
        );
    },

    async 'orders.getByName'(name) {
        check(name, String);
        return await OrdersCollection.findOne({ name });
    },

    async 'orders.getInRange'(startDate, endDate) {
        check(startDate, Date);
        check(endDate, Date);

        if (startDate >= endDate) {
            throw new Meteor.Error('bad-range', 'startDate must be before endDate');
        }

        return OrdersCollection.find(
            {
            createdAt: {
                $gte: startDate,
                $lte: endDate,
            },
            },
            {
            sort: { createdAt: 1 },
            }
        ).fetch();
  },
});
