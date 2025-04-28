import { Meteor } from 'meteor/meteor';
import { MenuCategories } from '../menu-categories-collection';

Meteor.publish('menuCategories.all', () => {
	return MenuCategories.find({}, {
		fields: {
		name:      1,
		sortOrder: 1,
		}
	});
});