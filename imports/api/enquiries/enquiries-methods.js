import { Meteor } from "meteor/meteor";
import { Email } from "meteor/email";
import { EnquiriesCollection } from "./enquiries-collection";

Meteor.methods({
  async "enquiry.insert"(enqContact,enqContent) {
    Email.sendAsync({to:enqContact,from:"donotreply.pressup@gmail.com",subject:"Thank you for reaching out",text:"we have recieved your enquiry and will respond as soon as possible.\n\nyour enquiry: \n'"+enqContent+"'"})
    const enquiry = {
        content: enqContent,
        contact:enqContact,
        date:Date.now(),
        active: true
    };
    return await EnquiriesCollection.insertAsync(enquiry);
  },
  async "enquiry.respond"(id,answer) {
    enquiry = await EnquiriesCollection.find({_id:id})
    Email.sendAsync({to:enquiry.contact,from:"donotreply.pressup@gmail.com",subject:"In response to your recent enquiry",text:answer})
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