import { MongoInternals } from "meteor/mongo";

/**
 * Apply a schema to a collection using a provided JSON validator.
 * This may create or update a collection using the given name.
 * Returns the collection.
 *
 * @param	{Object}	db								MongoDB database instance.
 * @param	{String}	collName						Name of collection to create or modify.
 * @param	{Object}	validator						JSON-Schema validation object.
 * @param	{Object}	[ options ]						MongoDB validation options.
 * @param	{String}	[ options.level = 'strict' ]	'strict', 'moderate', or 'off'.
 * @param	{String}	[ options.action = 'error' ]	'error' or 'warn'.
 * @returns {import('mongodb').Collection} 				The MongoDB collection object.
 */
export async function createOrUpdateCollection(
	db,
	collName,
	validator,
	options = {}
) {
	const { level = "strict", action = "error" } = options;

	// Attempt to apply the validator to the collection.
	try {
		await db.command({
			validator,
			validationLevel: level,
			validationAction: action,
		});
	}
	// If the collection isn't found, create it.
	catch (error) {
		if (error.codeName === "NamespaceNotFound") {
			await db.createCollection(collName, {
			validator,
			validationLevel: level,
			validationAction: action,
			});
		} 
		// If it's a different error, something else is wrong.
		else {
			throw error;
		}
	}

	// Return the new or modified collection.
	return db.collecion(collName)
}