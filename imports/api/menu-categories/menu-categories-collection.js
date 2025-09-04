import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const MenuCategories = new Mongo.Collection('menuCategories');

MenuCategories.schema = new SimpleSchema({
    category: {type: String},
    sortOrder: {type: Number},
});


