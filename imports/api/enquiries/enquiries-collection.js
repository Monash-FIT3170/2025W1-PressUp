import { Mongo } from "meteor/mongo";
import SimpleSchema from "simpl-schema";

export const EnquiriesCollection = new Mongo.Collection("enquiries");

EnquiriesCollection.schema = new SimpleSchema({
  content: { type: String },
  contact: { type: String },
  date: {type: Date},
  active: {type: Boolean, defaultValue: true},
  response: {type: String, optional: true},
  customerName: {type: String,optional:true}});
