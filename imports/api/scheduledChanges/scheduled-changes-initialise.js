import { Meteor } from 'meteor/meteor';
import { MongoInternals } from 'meteor/mongo';
import { createOrUpdateCollection } from '/imports/api/db-utils';

/**
 * Initialise the scheduledChanges collection.
 * Used to track deferred updates to menu items or other resources.
 */

Meteor.startup(async () => {
    const db = MongoInternals.defaultRemoteCollectionDriver().mongo.db;

    const validator = {
        $jsonSchema: {
            bsonType: 'object',
            required: ['targetCollection', 'targetId', 'changes', 'scheduledTime'],
            properties: {
                targetCollection: {
                    bsonType: 'string',
                    description: 'The name of the collection this change targets.'
                },
                targetId: {
                    bsonType: 'objectId',
                    description: 'The ID of the target document to be updated.'
                },
                changes: {
                    bsonType: 'object',
                    description: 'An object describing field updates to apply.'
                },
                scheduledTime: {
                    bsonType: 'date',
                    description: 'When this change should be applied.'
                },
                applied: {
                    bsonType: 'bool',
                    description: 'Whether the change has been applied.'
                },
                appliedAt: {
                    bsonType: ['date', 'null'],
                    description: 'Timestamp for when the change was applied.'
                },
                createdAt: {
                    bsonType: 'date',
                    description: 'When this change was created.'
                }
            }
        }
    };

    const scheduledChanges = await createOrUpdateCollection(
        db,
        'scheduledChanges',
        validator,
        { level: 'strict', action: 'error' }
    );

    // Index on scheduledTime for faster polling.
    await scheduledChanges.createIndex(
        { scheduledTime: 1, applied: 1 }
    );
});