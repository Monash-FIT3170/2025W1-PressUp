import { Meteor } from "meteor/meteor";
import { Email } from "meteor/email";
import { EnquiriesCollection } from "./enquiries-collection";

Meteor.methods({
  async "enquiry.insert"(enqContact,enqContent,enqName) {
    const enquiry = {
        content: enqContent,
        contact:enqContact,
        name:enqName,
        date:Date.now(),
        active: true,
        response: '',
    };
    console.log(enquiry)
    const result = await EnquiriesCollection.insertAsync(enquiry);
    const nenquiry = EnquiriesCollection.find();
    const message = await Email.sendAsync({to:enqContact,from:"donotreply.pressup@gmail.com",subject:"Your Enquiry: "+ result,html:`
    <h1>We have received your enquiry and will get back to you as soon as possible.</h1>
    <p><strong>Enquiry ID: </strong><em>` + result +`</em></p>
    <p>Your enquiry: </p><p><em>`+enqContent+`</em></p>
    <footer>
      <p>Best regards,</p>
      <p>the PressUp Team</p>
    </footer>
  `});
    //so we can reply to this later
    EnquiriesCollection.updateAsync({_id:result},{$set:{"confirmationMessageId": message.messageId}})
    return result;
  },
  async "enquiry.respond"(id,answer) {
    const enquiry = await EnquiriesCollection.findOneAsync({_id:id});
    answer = answer.replace(/\n/g,"<br />")
    if(enquiry.confirmationMessageId) {
      Email.sendAsync({to:enquiry.contact,from:"donotreply.pressup@gmail.com",inReplyTo: enquiry.confirmationMessageId,references:enquiry.confirmationMessageId,subject:"Re: Your Enquiry: " +id,html:`
        <p>`+answer+`</p>
        <footer>
            <p>Best regards,</p>
            <p>the PressUp Team</p>
        </footer>    
        `});
    } else {
      Email.sendAsync({to:enquiry.contact,from:"donotreply.pressup@gmail.com",subject:"Re: Your Enquiry: "+id,html:`
        <p>`+answer+`</p>
        <footer>
            <p>Best regards,</p>
            <p>the PressUp Team</p>
        </footer>    
        `});
    }
    
    return await EnquiriesCollection.updateAsync(
        { _id:id },
        {$set: { "active": false, "response": answer}}
      );
  },
  async "enquiry.draft"(id,draftAnswer) {
    const enquiry = await EnquiriesCollection.find({_id:id})
    return await EnquiriesCollection.updateAsync(
        { _id:id },
        {$set: {"response": draftAnswer}}
      );
  },
  async "enquiry.archive"(id) {
    return await EnquiriesCollection.updateAsync(
        { _id:id },
        {$set: { "active": false}}
      );
  }
});