import { Meteor } from "meteor/meteor";
import { TablesCollection } from "./TablesCollection.js";

Meteor.publish("tables.all", () => {
  return TablesCollection.find();
});