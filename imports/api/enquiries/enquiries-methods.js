import { Meteor } from "meteor/meteor";
import { EnquiriesCollection } from "./enquiries-collection";

Meteor.methods({
  async "enquiry.insert"(enquiry) {
    return await EnquiriesCollection.insertAsync(enquiry);
  },
  async "enquiry.respond"(id,answer) {
    //add code to send email
    return await EnquiriesCollection.updateAsync(
        { _id:id },
        { active: false, response: answer}
      );
  },
  async "enquiry.archive"(id) {
    return await EnquiriesCollection.updateAsync(
        { _id:id },
        { active: false}
      );
  }
});