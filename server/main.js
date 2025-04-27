import { Meteor } from 'meteor/meteor';
import { MenuCategories } from '/imports/api/menu-categories/menu-categories-collection';
import { Menu } from '/imports/api/menu/menu-collection';

Meteor.startup(async () => {
	// Testing menu and categories.
	// const nCategories = await MenuCategories.find().countAsync();
	// const nMenuItems = await Menu.find().countAsync();
	// console.log(`Init: ${nCategories} categories, ${nMenuItems} menu items.`);
});