import { ScheduledChanges } from '../imports/api/scheduled-changes/scheduled-changes-collection.js';
import { applyScheduledChange } from '../imports/api/scheduled-changes/apply-change.js';

// Interval to get and apply changes in milliseconds.
// Every interval, the server will check for pending scheduled changes and apply 
// them.
const INTERVAL_MILLIS = 5 * 60 * 1000;

async function getApplyScheduledChanges(date) {
	console.log(`Looking for scheduled changes at ${date}`);

	const changes = ScheduledChanges.find({
		scheduledTime: { $lte: date },
		applied: false
	});

	const count = await changes.countAsync();
	console.log(`Found ${count} changes to apply.`);

	for await (const change of changes) {
		try {
			applyScheduledChange(change);
		} catch (err) {
			console.error('Failed to apply change', change._id, err);
		}
	}
}

Meteor.startup(() => {
	getApplyScheduledChanges(new Date());

	Meteor.setInterval(() => {
		getApplyScheduledChanges(new Date());
	}, INTERVAL_MILLIS);
});