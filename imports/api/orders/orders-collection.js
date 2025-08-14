import { Mongo } from "meteor/mongo";
import SimpleSchema from "simpl-schema";

export const OrdersCollection = new Mongo.Collection("orders");

OrdersCollection.schema = new SimpleSchema({
  table: { type: Number },
  status: {
    type: String,
    allowedValues: ["open", "closed", "cancelled"],
    defaultValue: "open"
  },
  items: { type: Array },
  "items.$": Object,
  "items.$.menu_item": String,
  "items.$.quantity": Number,
  "items.$.price": Number,
  createdAt: { 
    type: Date, 
    defaultValue: new Date() 
  },
  recievedPayment: { 
    type: Number, 
    defaultValue: 0
  },
  discount: { 
    type: Number, 
    optional: true 
  },
  staffName: {
    type: String
  }
});