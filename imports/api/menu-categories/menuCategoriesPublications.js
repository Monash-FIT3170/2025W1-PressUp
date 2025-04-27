import { Meteor } from 'meteor/meteor';
import { MenuCategories } from '../menuCategoriesCollection';

Meteor.publish('menuCategories.all', () => {
	return MenuCategories.find({}, {
		fields: {
		name:      1,
		sortOrder: 1,
		}
	});
});