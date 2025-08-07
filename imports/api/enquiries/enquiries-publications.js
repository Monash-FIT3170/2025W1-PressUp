import { Meteor } from "meteor/meteor";
import { EnquiriesCollection } from "./enquiries-collection";

Meteor.publish("enquiries.all", () => {
  return EnquiriesCollection.find({},{sort: {date_created: -1}});
});

Meteor.publish("enquiries.active", () => {
    return EnquiriesCollection.find({active: true});
  });