import { Menu } from '../menu/menu-collection';
import { ScheduledChanges } from './scheduled-changes-collection';

export function applyScheduledChange(change) {
	const update = { $set: change.changes };

	switch (change.targetCollection) {
		case 'menu':
			Menu.updateAsync({ _id: change.targetId }, update);
			break;

		default:
			throw new Error(`Unsupported collection: ${change.targetCollection}`);
	}

	ScheduledChanges.updateAsync(change._id, {
		$set: {
			applied: true,
			appliedAt: new Date()
		}
	});
}