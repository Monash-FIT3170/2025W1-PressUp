import { Meteor } from "meteor/meteor";
import { InventoryCollection } from "./inventory-collection";

Meteor.publish("inventory.all", () => {
  return InventoryCollection.find();
});

Meteor.publish("inventory.nameIncludes", (subString) => {
  if (subString.length > 0) {
    return InventoryCollection.find({
      name: { $regex: subString, $options: "i" },
    });
  }
  return InventoryCollection.find();
});

Meteor.publish("inventory.nameStartsWith", (prefix) => {
    if (prefix && prefix.length > 0) {
      return InventoryCollection.find({
        name: { $regex: `^${prefix}`, $options: "i" },
      });
    }
    return InventoryCollection.find();
  });
