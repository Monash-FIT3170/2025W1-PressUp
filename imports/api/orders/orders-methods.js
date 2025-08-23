import {Meteor} from 'meteor/meteor';
import { OrdersCollection } from "./orders-collection";
import { check, Match } from 'meteor/check';

Meteor.methods({

    async 'orders.insert'(order) {
        return await OrdersCollection.insertAsync(order);
    },

    async 'orders.updatePayment'(id,payment) {
        return await OrdersCollection.updateAsync({_id: id},{$set: {"recievedPayment":payment}})
    },

    async 'orders.remove'(id) {
        return await OrdersCollection.removeAsync({_id: id});
    },
    
    async 'orders.markClosed'(id) {
        return await OrdersCollection.updateAsync(
            { _id: id },
            { $set: { status: "closed" } }
        );
    },

    async 'orders.markCancelled'(id) {
        return await OrdersCollection.updateAsync(
            { _id: id },
            { $set: { status: "cancelled" } }
        );
    },

    async 'orders.getByName'(name) {
        check(name, String);
        return await OrdersCollection.findOne({ name });
    },

});