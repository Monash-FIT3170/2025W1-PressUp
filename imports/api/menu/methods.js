import { Meteor } from 'meteor/meteor';
import { check }  from 'meteor/check';
import { Menu } from './collection';
import { MenuCategories } from '../menu-categories/collection';

Meteor.methods({
	/**
	 * Insert a new menu item.
	 * @param {{ name: string, price: number, menuCategory: string }} menuItem
	 */
	'menu.insert'({ name, price, menuCategory }) {
		check(name, 		String);
		check(price, 		Number);
		check(menuCategory, String);

		// Throw error if the category doesn't exist.
		if (!MenuCategories.findOne(menuCategory)) {
			throw new Meteor.Error(
				'invalid-category', 'The specified category does not exist.'
			);
		}

		return Menu.insert({
			name,
			price,
			menuCategory,
			available: true,
			ingredients: []
		})
	},

	/**
   * Update an existing menu item by Id.
   * @param {{
   * 	 _id: string, 
   * 	name: string, 
   * 	price: number, 
   * 	menuCategory: string, 
   * 	available: boolean 
   * }} menuItem
   */
	'menu.update'({ _id, name, price, menuCategory, available }) {
		check(_id,          String);
		check(name,         String);
		check(price,        Number);
		check(menuCategory, String);
		check(available,    Boolean);
	
		if (!MenuCategories.findOne(menuCategory)) {
			throw new Meteor.Error(
				'invalid-category', 'The specified category does not exist.'
			);
		}
	
		return Menu.update(
			{ _id },
			{
				$set: {
					name,
					price,
					menuCategory,
					available
				}
			}
		);
	},

	/**
	 * Remove a menu item by Id.
	 * @param {string} _id
	 */
	'menu.remove'(_id) {
		check(_id, String);

		return Menu.remove(_id);
	}
})