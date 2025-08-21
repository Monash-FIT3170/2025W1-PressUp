import { Meteor } from "meteor/meteor";
import { FeedbackCollection } from "./feedback-collection";

Meteor.publish("feedback.unresolved",()=>{
    return FeedbackCollection.find({resolved:false},{sort: {important: -1,date_created: -1}});
});

Meteor.publish("feedback.id",(id)=>{
    return FeedbackCollection.find({_id:id,resolved:false});
});