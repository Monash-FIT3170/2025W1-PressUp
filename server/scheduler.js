import { ScheduledChanges } from '../imports/api/scheduled-changes/scheduled-changes-collection.js';
import { applyScheduledChange } from '../imports/api/scheduled-changes/apply-change.js';

const ONE_MINUTE_MS = 60 * 1000;

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
	}, ONE_MINUTE_MS);
});