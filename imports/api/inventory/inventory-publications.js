import { Meteor } from "meteor/meteor";
import { InventoryCollection } from "./inventory-collection";

Meteor.publish("Inventory.all",()=> {
    return InventoryCollection.find();
})

Meteor.publish("Inventory.nameIncludes", (subString) => {
    if (subString.length > 0) {
        return InventoryCollection.find({name:{$regex:subString, $options: 'i'}});
    }
    return InventoryCollection.find();
})