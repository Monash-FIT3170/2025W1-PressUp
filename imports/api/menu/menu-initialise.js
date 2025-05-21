import { Meteor } from 'meteor/meteor';
import { MongoInternals } from 'meteor/mongo';
import { createOrUpdateCollection } from '/imports/api/db-utils';

/**
 * Initialise the menu collection.
 * Menu holds items customers can order.
 */

Meteor.startup(async () => {
    // Get active database.
    const db = MongoInternals.defaultRemoteCollectionDriver().mongo.db;

    // Define the validator schema.
    const validator = {
        $jsonSchema: {
            bsonType: 'object',
            required: ['name', 'price', 'menuCategory'],
            properties: {
                name: {
					bsonType: 'string',
					description: 'Menu item display name.'
				},
				price: {
					bsonType: 'decimal',
					description: 'Price of the menu item in dollars etc.'
				},
				menuCategory: {
					bsonType: 'objectId',
					description: 'An id of a menu category.'
				},
				ingredients: {
					bsonType: 'array',
					items: { bsonType: 'objectId' },
					description: 
						'A list of ingredient Ids that the item contains.'
				},
				available: {
					bsonType: 'bool',
					description: 
						'Whether the menu item is available to be ordered.'
				},
				schedule: {
					bsonType: 'array',
					description: 'A list of available times by day.',
					items: {
						bsonType: 'object',
						required: ['day', 'from', 'to'],
						properties: {
							day: {
								bsonType: 'string',
								enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
								description: 'Day of the week'
							},
							from: {
								bsonType: 'string',
								pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$',
								description: 'Start time in HH:mm format'
							},
							to: {
								bsonType: 'string',
								pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$',
								description: 'End time in HH:mm format'
							}
						}
					}
				},
				
				isHalal: {
					bsonType: 'bool',
					description: 
						'Whether the menu item is Halal.'
				},
				isVegetarian: {
					bsonType: 'bool',
					description: 
						'Whether the menu item is Vegatarian.'
				},
				isGlutenFree: {
					bsonType: 'bool',
					description: 
						'Whether the menu item is Gluten Free.'
				}

            }
        }
    };

	// Create or update the collection.
	const menu = await createOrUpdateCollection(
		db,
		'menu',
		validator,
		{ level: 'strict', action: 'error' }
	);

	// Create an index for name.
	await menu.createIndex(
		{ name: 1 },
		{ unique: true }
	);
})