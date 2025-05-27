import { Meteor } from "meteor/meteor";
import { OrdersCollection } from "./orders-collection";

Meteor.publish("orders.all", function() {
  return OrdersCollection.find();
});

Meteor.publish("orders.id", function(myId) {
  return OrdersCollection.find({_id:myId});
})

// Active orders
Meteor.publish("orders.active", function() {
  return OrdersCollection.find({ status: "open" });
});

// Orders for a specific table
Meteor.publish("orders.byTable", function(tableNumber) {
  return OrdersCollection.find({ table: tableNumber });
});

// Orders created after a specific date
Meteor.publish("orders.dateAfter", function(date) {
  return OrdersCollection.find({ 
    createdAt: { $gte: new Date(date) } 
  });
});

// Orders created before a specific date
Meteor.publish("orders.dateBefore", function(date) {
  return OrdersCollection.find({ 
    createdAt: { $lte: new Date(date) } 
  });
});

// Orders within a date range
Meteor.publish("orders.dateRange", function(startDate, endDate) {
  return OrdersCollection.find({ 
    createdAt: { 
      $gte: new Date(startDate), 
      $lte: new Date(endDate) 
    } 
  });
});

