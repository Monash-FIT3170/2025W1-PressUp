import { Meteor } from "meteor/meteor";
import { FeedbackCollection } from "./feedback-collection";
import { OrdersCollection } from "../orders/orders-collection";

Meteor.methods({
  async "feedback.insert"(ordId,rate,text,customerName) {
    //Check order exists
    const order = await OrdersCollection.find({_id:ordId}).fetch();
    const feedback = {
        content: text,
        orderID: ordId,
        name: customerName,
        date:Date.now(),
        resolved: false,
        important: false,
        rating: rate,
    };
    if (order.length > 0) {
        const result = await FeedbackCollection.insertAsync(feedback);
        return result
    }
    return -1;
  },

  async "feedback.priority"(id,priority) {
    await FeedbackCollection.updateAsync(
        { _id:id },
        {$set: { "important": priority}}
      );
    return priority
  },

  async "feedback.resolve"(id) {
    return await FeedbackCollection.updateAsync(
        { _id:id },
        {$set: { "resolved": true}}
      );
  }
});