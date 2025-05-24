import { Meteor } from 'meteor/meteor';
import { check, Match }  from 'meteor/check';
import { MenuCategories } from './menu-categories-collection';

Meteor.methods({
	/**
	 * Insert a new menu category.
	 * @param {{ category: string, sortOrder: number }} menuCategory
	 */

	async 'menuCategories.insert'({ category, sortOrder }) {
		check(category, String);
		check(sortOrder, Number);

		return await MenuCategories.insertAsync({
			category,
			sortOrder: Math.floor(sortOrder)
		});
	},

	/**
	 * Update a menu category by Id.
	 * @param {{ _id: String, category: string, sortOrder: number }} menuCategory
	 */

	async 'menuCategories.update'({ _id, menuCategory }) {
		check(_id, 			String);

		// Ensure the menu category object is correct.
		check(menuCategory, {
			category: Match.Optional(String),
			sortOrder: Match.Optional(Number)
		});

		// Convert to an object with only the keys that were provided.
		const menuCategoryDoc = Object.fromEntries(
			Object.entries(menuCategory).filter(([key, val]) => 
				val !== undefined)
		);

		// Don't update if there are no properties to update.
		if (Object.keys(menuCategoryDoc).length === 0) {
			throw new Meteor.Error(
				'no-update', 'No fields provided to update.'
			);
		}

		return await MenuCategories.updateAsync(
			{ _id }, { $set: menuCategoryDoc }
		);
	},

	/**
	 * Remove a menu category by Id.
	 * @param {String} _id
	 */

	async 'menuCategories.remove'(_id) {
		check(_id, String);

		return await MenuCategories.removeAsync(_id);
	},

  	async 'menuCategories.getCategories'() {
	// const raw = MenuCategories.rawCollection();
	// const categories = await raw.find({}, { projection: { category: _id } }).toArray();
	// return categories.map(cat => cat.category);
	return await MenuCategories.find().fetch();
	}
})