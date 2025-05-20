import { ScheduledChanges } from '../imports/api/scheduled-changes/scheduled-changes-collection.js';
import { applyScheduledChange } from '../imports/api/scheduled-changes/apply-change.js';

const ONE_MINUTE_MS = 60 * 1000;

Meteor.startup(() => {
  Meteor.setInterval(() => {
    const NOW = new Date();

    ScheduledChanges.find({
      scheduledTime: { $lte: NOW },
      applied: false
    }).forEach(change => {
      try {
        applyScheduledChange(change);
      } 
	  catch (err) {
        console.error('Failed to apply change', change._id, err);
      }
    });
  }, 
  // Run every minute.
  ONE_MINUTE_MS);
});