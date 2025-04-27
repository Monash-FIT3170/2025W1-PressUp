import { Meteor } from 'meteor/meteor';
import { MenuItems } from './menu-collection';

Meteor.publish('menuItems.all', function () {
	return MenuItems.find({}, {
		fields: {
			name:         1,
			price:        1,
			menuCategory: 1,
			available:    1
		}
	});
});

Meteor.publish('menuItems.byCategory', (menuCategory) => {
	check(menuCategory, String);
	return MenuItems.find({ menuCategory: menuCategory }, {
		fields: { name: 1, price: 1, available: 1 }
	});
});