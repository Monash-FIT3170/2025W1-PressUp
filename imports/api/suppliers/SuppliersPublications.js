import { Meteor } from "meteor/meteor";
import { SuppliersCollection } from "./SuppliersCollection";

Meteor.publish("Suppliers", () => {
  return SuppliersCollection.find();
});

Meteor.publish("suppliers.nameIncludes", (subString) => {
  if (subString.length > 0) {
    return SuppliersCollection.find({
      name: { $regex: subString, $options: "i" },
    });
  }
  return SuppliersCollection.find();
});