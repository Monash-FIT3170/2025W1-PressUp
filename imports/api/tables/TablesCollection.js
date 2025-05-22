import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const TablesCollection = new Mongo.Collection('tables');

SuppliersCollection.schema = new SimpleSchema({
    table_number: {type: Number},
    table_capacity: {type: Number},
    table_width: {type: Number},
    table_height: {type: Number},
    table_xpos: {type: Number},
    table_ypos: {type: Number},
    table_status: {type:  String}
});