import { Mongo } from "meteor/mongo";
import SimpleSchema from "simpl-schema";

export const InventoryCollection = new Mongo.Collection("inventory");

InventoryCollection.schema = new SimpleSchema({
  name: { type: String },
  quantity: { type: Number, defaultValue: 1 },
  units: { type: String, defaultValue: "unit(s)" },
  prices: { type: Number, optional: true },
  suppliers: { type: Array, optional: true },
  "suppliers.$": String,
});
