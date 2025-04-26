import { Meteor } from "meteor/meteor";
import { SuppliersCollection } from "./SuppliersCollection";

Meteor.publish("Suppliers", () => {
  return SuppliersCollection.find();
});