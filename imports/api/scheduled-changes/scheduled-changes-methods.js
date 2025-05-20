import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { ScheduledChanges } from './scheduled-changes-collection.js';

Meteor.methods({
	'scheduledChanges.insert'(targetCollection, targetId, changes, scheduledTime) {
		check(targetCollection, String);
		check(targetId, String);
		check(changes, Object);
		check(scheduledTime, Date);

		return ScheduledChanges.insert({
			targetCollection,
			targetId,
			changes,
			scheduledTime,
			applied: false,
			appliedAt: null,
			createdAt: new Date()
		});
	}
});