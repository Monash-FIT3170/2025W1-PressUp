import { Meteor } from 'meteor/meteor';
import { ScheduledChanges } from './scheduled-changes-collection.js';

// Get all scheduled changes (admin/debugging).
Meteor.publish('scheduledChanges.all', function () {
	return ScheduledChanges.find();
});

// Get only unapplied (upcoming) changes.
Meteor.publish('scheduledChanges.pending', function () {
	return ScheduledChanges.find({ applied: false });
});

// Get scheduled changes for a specific collection (e.g. menuItems).
Meteor.publish('scheduledChanges.byTargetCollection', function (collectionName) {
	check(collectionName, String);
	
	return ScheduledChanges.find({ targetCollection: collectionName });
});

// Get scheduled changes for a specific document (e.g. menu item).
Meteor.publish('scheduledChanges.byTargetId', function (targetId) {
	check(targetId, String);

	return ScheduledChanges.find({ targetId });
});

// Get scheduled changes that are due after a given date.
Meteor.publish('scheduledChanges.afterDate', function (date) {
	check(date, Date);

	return ScheduledChanges.find({
		scheduledTime: { $gte: date }
	});
});

// Get scheduled changes within a date range.
Meteor.publish('scheduledChanges.dateRange', function (startDate, endDate) {
	check(startDate, Date);
	check(endDate, Date);

	return ScheduledChanges.find({
		scheduledTime: {
			$gte: startDate,
			$lte: endDate
		}
	});
});