import { Meteor } from "meteor/meteor";
import { TablesCollection } from "./TablesCollection.js";

Meteor.publish("Tables", () => {
  return TablesCollection.find();
});