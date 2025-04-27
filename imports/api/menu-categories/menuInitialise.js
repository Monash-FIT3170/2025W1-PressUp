import { Meteor } from 'meteor/meteor';
import { MongoInternals } from 'meteor/mongo';
import { createOrUpdateCollection } from '/imports/schemaUtils';

/**
 * Initialise the menu categories collection.
 * These group menu items.
 */

Meteor.startup(async () => {
    // Get active database.
    const db = MongoInternals.defaultRemoteCollectionDriver().mongo.db;

    // Define the validator schema.
    const validator = {
        $jsonschema: {
            bsonType: 'object',
            required: ['name', 'sortOrder'],
            properties: {
                name: {
                    bsonType: 'string',
                    description: 'Category display name.'
                },
                sortOrder: {
                    bsonType: 'int',
                    minimum: 0,
                    description: 'Order in which to show the category in lists.'
                }
            }
        }
    };

	// Create or update the collection.
	const categories = await createOrUpdateCollection(
		db,
		'menuCategories',
		validator,
		{ level: 'strict', action: 'error' }
	);

	// Create an index for name.
	await categories.createIndex(
		{ name: 1 },
		{ unique: true }
	);
})