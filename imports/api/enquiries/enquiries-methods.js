import { Meteor } from "meteor/meteor";
import { Email } from "meteor/email";
import { EnquiriesCollection } from "./enquiries-collection";

Meteor.methods({
  async "enquiry.insert"(enqContact,enqContent) {
    const enquiry = {
        content: enqContent,
        contact:enqContact,
        date:Date.now(),
        active: true,
        response: '',
    };
    const result = await EnquiriesCollection.insertAsync(enquiry);
    Email.sendAsync({to:enqContact,from:"donotreply.pressup@gmail.com",subject:"Thank you for reaching out",html:`
    <h1>We have received your enquiry and will get back to you as soon as possible.</h1>
    <p><strong>Enquiry ID: </strong><em>` + result +`</em></p>
    <p>Your enquiry: </p><p><em>`+enqContent+`</em></p>
    <footer>
      <p>Best regards,</p>
      <p>the PressUp Team</p>
    </footer>
  `})
    
    return result
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