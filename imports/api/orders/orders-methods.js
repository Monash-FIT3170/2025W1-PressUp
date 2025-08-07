import {Meteor} from 'meteor/meteor';
import { OrdersCollection } from "./orders-collection";
import { Menu } from '/imports/api/menu/menu-collection';
import { InventoryCollection } from '/imports/api/inventory/inventory-collection';

Meteor.methods({

    async 'orders.insert'(order) {
        // unable to properly obtain the menu item data (obviously cant obtain inventory item data then cost either))
        const orderItemsWithCosts = [];

        for (const item of order.items) {
            const menuItem = await Menu.findOneAsync({ _id: item._id });
            if (!menuItem) {
                throw new Meteor.Error('menu-item-not-found', `Menu item with ID ${item._id} not found.`);
            }

            const ingredients = await InventoryCollection.find({
                _id: { $in: menuItem.ingredients || [] }
                }).fetchAsync();


            const ingredientCost = ingredients.reduce((sum, ingredient) => sum + (ingredient.price || 0), 0);

            orderItemsWithCosts.push({
                ...item,
                ingredientCost: ingredientCost
            });
        }

        const orderWithCosts = {
            ...order,
            items: orderItemsWithCosts
        };
        return await OrdersCollection.insertAsync(order);
    },

    async 'orders.updatePayment'(id,payment) {
        return await OrdersCollection.updateAsync({_id: id},{$set: {"recievedPayment":payment}})
    },

    async 'orders.remove'(id) {
        return await OrdersCollection.removeAsync({_id: id});
    }
});