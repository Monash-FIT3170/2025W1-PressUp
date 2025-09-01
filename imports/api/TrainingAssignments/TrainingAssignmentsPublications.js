import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { TrainingAssignments } from './TrainingAssignmentsCollection';

// Current user's assignments
Meteor.publish('trainingAssignments.mine', function () {
  if (!this.userId) return this.ready();
  return TrainingAssignments.find({ userId: this.userId });
});

// Admin: all assignments for everyone (for dashboards if needed)
Meteor.publish('trainingAssignments.all', function () {
  const me = Meteor.users.findOne(this.userId);
  if (!me?.isAdmin) return this.ready();
  return TrainingAssignments.find({});
});
