import {Mongo} from "meteor/mongo";
import SimpleSchema from 'simpl-schema';

export const InventoryCollection = new Mongo.Collection("inventory");

InventoryCollection.schema = new SimpleSchema({
    name: {type: String},
    qty: {type: Number,defaultValue: 1},
    unit: {type: String,defaultValue: 'unit(s)'},
    price: {type: Number,optional: true},
    supplier: {type: Array,optional: true},
    'supplier.$': String,
})