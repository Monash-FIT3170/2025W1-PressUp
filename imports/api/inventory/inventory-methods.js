import {Meteor} from 'meteor/meteor';
import { InventoryCollection } from "./inventory-collection";

Meteor.methods({

    async 'inventory.insert'(inventoryItem) {
        return await InventoryCollection.insertAsync(inventoryItem);
    }
});