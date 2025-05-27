import { Meteor } from "meteor/meteor";
import { InventoryCollection } from "./inventory-collection";

Meteor.methods({
  async "inventory.insert"(inventoryItem) {
    return await InventoryCollection.insertAsync(inventoryItem);
  },

  async "inventory.update"({ name, inventoryItem }) {
    return await InventoryCollection.updateAsync({ name: name }, inventoryItem);
  },

  async "inventory.incrementQty"({ name, increment }) {
    return await InventoryCollection.updateAsync(
      { name: name },
      { $inc: { qty: increment } }
    );
  },

  async "inventory.remove"(name) {
    try {
      const result = await InventoryCollection.removeAsync({ name: name });
      console.log(
        `Inventory item removed: ${name}, Removed documents: ${result}`
      );
    } catch (error) {
      console.error(`Error removing inventory item ${name}:`, error);
      throw new Meteor.Error(
        "remove-failed",
        "Failed to remove the inventory item."
      );
    }
  },

  async "inventory.clear"() {
    return await InventoryCollection.removeAsync({});
  },
});
