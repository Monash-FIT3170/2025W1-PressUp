import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { TrainingAssignments } from './TrainingAssignmentsCollection';
import { TrainingModules } from '../trainingModules/trainingModuleCollection';

Meteor.methods({
  // Admin assigns a module "type" (from TrainingModules) to any user
  async 'trainingAssignments.assign'({ userId, moduleId }) {
    check(userId, String);
    check(moduleId, String);

    // must be logged in
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    // load the current user with only what we need
    const me = await Meteor.users.findOneAsync(this.userId, { fields: { isAdmin: 1 } });
    if (!me?.isAdmin) {
      throw new Meteor.Error('not-authorized', 'Only admins can assign modules');
    }

    // Ensure module exists
    const mod = await TrainingModules.findOneAsync(moduleId);
    if (!mod) {
      throw new Meteor.Error('not-found', 'Module not found');
    }

    // Avoid duplicate "assigned" entries for same user/module combo
    const existing = await TrainingAssignments.findOneAsync({ userId, moduleId, status: 'assigned' });
    if (existing) return existing._id;

    return await TrainingAssignments.insertAsync({
      userId,
      moduleId,
      status: 'assigned',
      assignedAt: new Date(),
    });
  },

  // Staff action: mark their own assignment completed
  async 'trainingAssignments.markComplete'({ moduleId }) {
    check(moduleId, String);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    const assignment = await TrainingAssignments.findOneAsync({
      userId: this.userId,
      moduleId,
    });

    if (!assignment) {
      throw new Meteor.Error('not-found', 'You do not have this module assigned');
    }

    await TrainingAssignments.updateAsync(
      { _id: assignment._id },
      { $set: { status: 'completed', completedAt: new Date() } }
    );

    return assignment._id;
  },
});
