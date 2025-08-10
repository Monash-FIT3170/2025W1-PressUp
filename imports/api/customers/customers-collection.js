import { Mongo } from "meteor/mongo";
import SimpleSchema from "simpl-schema";

export const CustomersCollection = new Mongo.Collection("customers");

CustomersCollection.schema = new SimpleSchema({
  name: { type: String },
  loyaltyPoints: { type: Number, defaultValue: 0, optional: true },
  email: { type: String, optional: true }, // We will check for duplicates through email
  phone: { type: String, optional: true },
});
