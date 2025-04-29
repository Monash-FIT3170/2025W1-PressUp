import { Meteor } from 'meteor/meteor';
import { check, Match }  from 'meteor/check';
import { Menu } from './menu-collection';
import { MenuCategories } from '../menu-categories/menu-categories-collection';
import { ObjectId, Decimal128 } from 'mongodb';

Meteor.methods({
	/**
	 * Insert a new menu item.
	 * @param {{ 
	 * 		name: string 
	 *   	price: number, 
	 *   	menuCategory?: string,
	 *   	available?: boolean,
	 *   	ingredients?: string[]
	 * }} menuItem
	 */
	async 'menu.insert'({menuItem}) {
		// Ensure the menu item object is correct.
		check(menuItem, {
			name: String,
			price: Number,
			menuCategory: Match.Optional(String),
			available: Match.Optional(Boolean),
			ingredients: Match.Optional([String]),
		});

		// Ensure the menu category exists, otherwise throw an error
		// Commented this out for now as we don't have any categories yet.
		// if (!(await MenuCategories.findOneAsync(menuItem.menuCategory))) {
		// 	throw new Meteor.Error(
		// 		'invalid-category',
		// 		'The specified category does not exist.'
		// 	);
		// }
		console.log('Inserting menu item:', menuItem);

		// Convert to an object with only the keys that were provided.
		const menuItemDoc = Object.fromEntries(
			Object.entries(menuItem).filter(([key, val]) => 
				val !== undefined)
		);

		// Don't update if there required properties missing.
		if (!('name' in menuItemDoc) || !('price' in menuItemDoc)) {
			throw new Meteor.Error(
				'required-missing', 'Required fields are missing.'
			);
		}

		if (typeof menuItemDoc.price === 'number') {
			menuItemDoc.price = Decimal128.fromString(menuItemDoc.price.toString());
		  }

		if (menuItemDoc.menuCategory) {
			menuItemDoc.menuCategory = new ObjectId(menuItemDoc.menuCategory);
		}

		console.log('Final menu item document:', menuItemDoc);
		
		return await Menu.insertAsync(menuItemDoc)
	},

	/**
	* Update an existing menu item by Id.
	* @param {{ 
	* 		name?: string 
	*   	price?: number, 
	*   	menuCategory?: string,
	*   	available?: boolean,
	*   	ingredients?: string[]
	* }} menuItem
    */
	async 'menu.update'({ _id, menuItem}) {
		check(_id, String);
		// Ensure the menu item object is correct.
		check(menuItem, {
			name: Match.Optional(String),
			price: Match.Optional(Number),
			menuCategory: Match.Optional(String),
			available: Match.Optional(Boolean),
			ingredients: Match.Optional([String]),
		});
	
		// Ensure the menu category exists, otherwise throw an error.
		if (menuCategory && !MenuCategories.findOne(menuCategory)) {
			throw new Meteor.Error(
				'invalid-category', 'The specified category does not exist.'
			);
		}

		// Convert to an object with only the keys that were provided.
		const menuItemDoc = Object.fromEntries(
			Object.entries(menuItem).filter(([key, val]) => val !== undefined)
		);

		// Don't update if there are no properties to update.
		if (Object.keys(menuItemDoc).length === 0) {
			throw new Meteor.Error(
				'no-update', 'No fields provided to update.'
			);
		}
	
		return await Menu.updateAsync({ _id }, { menuItemDoc });
	},

	/**
	 * Remove a menu item by Id.
	 * @param {string} _id
	 */
	async 'menu.remove'(_id) {
		check(_id, String);

		return await Menu.removeAsync(_id);
	},

	async 'menu.getAll'() {
		return await Menu.find().fetch();
	}
})