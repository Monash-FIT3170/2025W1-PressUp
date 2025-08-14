import { Mongo } from 'meteor/mongo';
import SimpleSchema from "simpl-schema";

export const ScheduledChanges = new Mongo.Collection('scheduledChanges');

SimpleSchema.Schema = new SimpleSchema({
  targetCollection: {
    type: String,
    label: 'The name of the collection this change targets.'
  },
  targetId: {
    type: String,
    label: 'The ID of the target document to be updated.'
  },
  changes: {
    type: Object,
    label: 'An object describing field updates to apply.',
    blackbox: true
  },
  scheduledTime: {
    type: Date,
    label: 'When this change should be applied.'
  },
  applied: {
    type: Boolean,
    optional: true,
    label: 'Whether the change has been applied.'
  },
  appliedAt: {
    type: Date,
    optional: true,
    label: 'Timestamp for when the change was applied.'
  },
  createdAt: {
    type: Date,
    label: 'When this change was created.'
  }
});

// Index on scheduledTime for faster polling.
await ScheduledChanges.createIndex(
    { scheduledTime: 1, applied: 1 }
);