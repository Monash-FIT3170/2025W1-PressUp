import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { TrainingModules } from './trainingModuleCollection';

// Everyone can see the list of module types
Meteor.publish('trainingModules.all', function () {
  return TrainingModules.find({}, { sort: { createdAt: -1 } });
});

Meteor.publish('trainingModules.one', function (moduleId) {
  check(moduleId, String);
  return TrainingModules.find({ _id: moduleId });
});
