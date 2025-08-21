import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Menu = new Mongo.Collection('menu');

Menu.schema = new SimpleSchema({
    name: {
        type: String,
        label: 'Menu item display name.'
    },

    price: {
        type: String,
        regEx: /^\d+(\.\d{1,2})?$/,
        label: 'Price of the menu item in dollars etc.'
    },

    menuCategory: {
        type: String,
        label: 'An id of a menu category.'
    },

    // menuSubCategory: {
    //   type: String,
    //   regEx: /^[a-fA-F0-9]{24}$/,
    //   optional: true,
    //   label: 'An id of a menu sub category.'
    // },

    ingredients: {
        type: Array,
        optional: true,
        label: 'A list of ingredient Ids that the item contains.'
    },
    'ingredients.$': {
        type: String
    },

    available: {
        type: Boolean,
        optional: true,
        label: 'Whether the menu item is available to be ordered.'
    },

    schedule: {
        type: Array,
        optional: true,
        label: 'A list of available times by day.'
    },
    'schedule.$': {
        type: Object
    },
    'schedule.$.day': {
        type: String,
        allowedValues: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday'
        ],
        label: 'Day of the week'
    },
    'schedule.$.from': {
        type: String,
        label: 'Start time in HH:mm format'
    },
    'schedule.$.to': {
        type: String,
        label: 'End time in HH:mm format'
    },

    isHalal: {
        type: Boolean,
        optional: true,
        label: 'Whether the menu item is Halal.'
    },

    isVegetarian: {
        type: Boolean,
        optional: true,
        label: 'Whether the menu item is Vegetarian.'
    },

    isGlutenFree: {
        type: Boolean,
        optional: true,
        label: 'Whether the menu item is Gluten Free.'
    }
});