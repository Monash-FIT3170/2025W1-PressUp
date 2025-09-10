import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Menu = new Mongo.Collection('menu');

Menu.schema = new SimpleSchema({
    name: {
        type: String,
        label: 'Menu item display name.'
    },

    price: {
        type: Number,
        regEx: /^\d+(\.\d{1,2})?$/,
        label: 'Price of the menu item in dollars etc.'
    },

    menuCategory: {
        type: String,
        label: 'An id of a menu category.'
    },

    // Fixed ingredients schema to match your methods
    ingredients: {
        type: Array,
        optional: true,
        label: 'A list of ingredients with their amounts.'
    },
    'ingredients.$': {
        type: Object,
        label: 'Individual ingredient with id and amount'
    },
    'ingredients.$.id': {
        type: String,
        label: 'Ingredient ID'
    },
    'ingredients.$.amount': {
        type: Number,
        label: 'Amount of ingredient'
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

    seasons: {
        type: Array,
        optional: true,
        label: 'seasons available'
    },
    'seasons.$': {
        type: String,
        allowedValues: [
            'Summer',
            'Winter',
            'Autumn',
            'Spring'
        ],
        label: 'seasons available'
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