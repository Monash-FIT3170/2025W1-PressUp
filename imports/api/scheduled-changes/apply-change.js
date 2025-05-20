import { MenuItems } from '../menu/menu-collection';
import { ScheduledChanges } from './scheduled-changes-collection';

export function applyScheduledChange(change) {
	const update = { $set: change.changes };

	switch (change.targetCollection) {
		case 'menuItems':
			MenuItems.update({ _id: change.targetId }, update);
			break;

		default:
			throw new Error(`Unsupported collection: ${change.targetCollection}`);
	}

	ScheduledChanges.update(change._id, {
		$set: {
			applied: true,
			appliedAt: new Date()
		}
	});
}