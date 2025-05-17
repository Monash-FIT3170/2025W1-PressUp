import {Meteor} from 'meteor/meteor';
import { OrdersCollection } from "./orders-collection";

Meteor.methods({

    async 'orders.insert'(order) {
        return await OrdersCollection.insertAsync(order);
    },

    async 'inventory.remove'(id) {
        return await OrdersCollection.removeAsync({_id: id});
    }
});