import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const SuppliersCollection = new Mongo.Collection('suppliers');

SuppliersCollection.schema = new SimpleSchema({
    abn: {type: String},
    active: {type: Boolean},
    name: {type: String},
    contactPerson: {type: String},
    email: {type: String},
    phone: {type: String},
    address: {type: String},
    productsSupplied: {type: Array},
    'productsSupplied.$': Number, // Each item in the array is a String
    notes: {type: String},
});