import { Meteor } from 'meteor/meteor';
import { MongoInternals } from 'meteor/mongo';
import { createOrUpdateCollection } from '/imports/schemaUtils';

/**
 * Initialise the intentory collection.
 */

Meteor.startup(async () => {
    // Get active database.
    const db = MongoInternals.defaultRemoteCollectionDriver().mongo.db;

    // Define the validator schema.
    const validator = {
        $jsonschema: {
            bsonType: 'object',
            required: ['name'],
            properties: {
                name: {
                    bsonType: 'string',
                    description: 'Inventory item display name.'
                }
            }
        }
    };

	// Create or update the collection.
	const categories = await createOrUpdateCollection(
		db,
		'inventory',
		validator,
		{ level: 'strict', action: 'error' }
	);

	// Create an index for name.
	await categories.createIndex(
		{ name: 1 },
		{ unique: true }
	);
})