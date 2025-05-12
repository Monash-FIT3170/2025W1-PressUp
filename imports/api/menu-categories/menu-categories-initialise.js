import { Meteor } from 'meteor/meteor';
import { MongoInternals } from 'meteor/mongo';
import { createOrUpdateCollection } from '/imports/api/db-utils';
import { MenuCategories } from '/imports/api/menu-categories/menu-categories-collection';

/**
 * Initialise the menu categories collection.
 * These group menu items.
 */

Meteor.startup(async () => {
    // Get active database.
    const db = MongoInternals.defaultRemoteCollectionDriver().mongo.db;
    const defaultCategories = [
        { category: 'drinks', sortOrder: 1 },
        { category: 'breakfast', sortOrder: 2 },
        { category: 'lunch', sortOrder: 3 },
        { category: 'pastries', sortOrder: 4 }
    ];

    const rawCategories = MenuCategories.rawCollection();

    // Loop over each default category and insert if not already present.
    for (const { category, sortOrder } of defaultCategories) {
        const existingCategory = await MenuCategories.findOneAsync({ category });
        console.log(`Checking category: ${category}, existing: ${existingCategory}`);

        // If the category doesn't already exist, insert it.
        if (!existingCategory) {
            try {
                await MenuCategories.insertAsync({ category, sortOrder });
            } catch (error) {
                console.error(`Failed 1to insert category: ${category}`, error);
            }
        }
    }
    // Optional: Add unique index on the category field
    await rawCategories.createIndex({ category: 1 }, { unique: true });

    // Define the validator schema.
    const validator = {
        $jsonSchema: {
            bsonType: 'object',
            required: ['category', 'sortOrder'],
            properties: {
                category: {
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


})