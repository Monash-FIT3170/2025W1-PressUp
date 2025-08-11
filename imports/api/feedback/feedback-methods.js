import { Meteor } from "meteor/meteor";
import { FeedbackCollection } from "./feedback-collection";

Meteor.methods({
  async "feedback.insert"(ordId,rate,text,customerName) {
    const feedback = {
        content: text,
        orderID: ordId,
        name: customerName,
        date:Date.now(),
        resolved: false,
        important: false,
        rating: rate,
    };
    const result = await FeedbackCollection.insertAsync(feedback);
    return result;
  },

  async "enquiry.priority"(id,priority) {
    return await FeedbackCollection.updateAsync(
        { _id:id },
        {$set: { "important": priority}}
      );
  },

  async "enquiry.resolve"(id) {
    return await FeedbackCollection.updateAsync(
        { _id:id },
        {$set: { "resolved": true}}
      );
  }
});