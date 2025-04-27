import { Meteor } from 'meteor/meteor';
import { check }  from 'meteor/check';
import { MenuCategories } from './menu-categories-collection';

Meteor.methods({
	/**
	 * Insert a new menu category.
	 * @param {{ name: string, sortOrder: number }} menuCategory
	 */

	async 'menuCategories.insert'({ name, sortOrder }) {
		check(name, 		String);
		check(sortOrder, 	Number);

		return await MenuCategories.insertAsync({
			name,
			sortOrder: Math.floor(sortOrder)
		});
	},

	/**
	 * Update a menu category by Id.
	 * @param {{ _id: String, name: string, sortOrder: number }} menuCategory
	 */

	async 'menuCategories.update'({ _id, name, sortOrder }) {
		check(_id, 			String);
		check(name,			String);
		check(sortOrder, 	Number);

		return await MenuCategories.updateAsync(
			{ _id },
			{
				$set: {
					name,
					sortOrder: Math.floor(sortOrder)
				}
			}
		);
	},

	/**
	 * Remove a menu category by Id.
	 * @param {String} _id
	 */

	async 'menuCategories.remove'(_id) {
		check(_id, String);

		return await MenuCategories.removeAsync(_id);
	}
})