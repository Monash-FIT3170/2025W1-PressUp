import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { TrainingModules } from './trainingModuleCollection';

// All DB ops use *Async variants; user lookups use this.userId + findOneAsync
Meteor.methods({
  // Admin-only: create a module template
  async 'trainingModules.insert'(doc) {
    check(doc, {
      title: String,
      description: String,
      duration: Match.Where(n => typeof n === 'number' && n >= 0),
      link: Match.Optional(String), // optional to match schema
    });

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }
    const me = await Meteor.users.findOneAsync(this.userId, { fields: { isAdmin: 1 } });
    if (!me?.isAdmin) {
      throw new Meteor.Error('not-authorized', 'Only admins can create modules');
    }

    return await TrainingModules.insertAsync({
      ...doc,
      createdAt: new Date(),
      createdBy: this.userId,
    });
  },

  // Admin-only: remove a module template
  async 'trainingModules.remove'(moduleId) {
    check(moduleId, String);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }
    const me = await Meteor.users.findOneAsync(this.userId, { fields: { isAdmin: 1 } });
    if (!me?.isAdmin) {
      throw new Meteor.Error('not-authorized', 'Only admins can remove modules');
    }

    return await TrainingModules.removeAsync(moduleId);
  },
});
