import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
// Each doc represents a module assigned to a specific user
export const TrainingAssignments = new Mongo.Collection('training_assignments');

TrainingAssignments.schema = new SimpleSchema({
    userId: { type: String },
    moduleId: { type: String },
    status: { type: String, allowedValues: ['assigned', 'completed'], defaultValue: 'assigned' },
    assignedAt: { type: Date, defaultValue: new Date() },
    completedAt: { type: Date, optional: true },
})


