import { Meteor } from "meteor/meteor";
import { InventoryCollection } from "./inventory-collection";

Meteor.publish("Inventory.all",()=> {
    return InventoryCollection.find();
})