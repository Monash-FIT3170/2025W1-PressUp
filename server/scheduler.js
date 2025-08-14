import { Meteor } from 'meteor/meteor';
import { ScheduledChanges } from '../imports/api/scheduled-changes/scheduled-changes-collection.js';
import { applyScheduledChange } from '../imports/api/scheduled-changes/apply-change.js';

const INTERVAL_MILLIS = 5 * 60 * 1000; // 5 mins.

async function getApplyScheduledChanges(now = new Date()) {
  console.log(`Looking for scheduled changes at ${now.toISOString()}`);

  const query = {
    scheduledTime: { $lte: now },
    applied: { $ne: true },
  };

  const changes = await ScheduledChanges.find(query).fetchAsync();
  console.log(`Found ${changes.length} changes to apply.`);

  for (const change of changes) {
    try {
      await applyScheduledChange(change);

      await ScheduledChanges.updateAsync(
        { _id: change._id },
        { $set: { applied: true, appliedAt: new Date() } }
      );
    } catch (err) {
      console.error('Failed to apply change', change._id, err);
    }
  }
}

Meteor.startup(() => {
  // Run once at startup
  void getApplyScheduledChanges();

  // Then every minute
  Meteor.setInterval(() => {
    void getApplyScheduledChanges();
  }, INTERVAL_MILLIS);
});