import { Meteor } from 'meteor/meteor';
import { Menu } from './menu-collection';

Meteor.publish('menu.all', function () {
	return Menu.find({}, {
		fields: {
			name:         1,
			price:        1,
			menuCategory: 1,
			available:    1
		}
	});
});

Meteor.publish('menu.byCategory', (menuCategory) => {
	check(menuCategory, String);
	return Menu.find({ menuCategory: menuCategory }, {
		fields: { name: 1, price: 1, available: 1 }
	});
});

Meteor.publish("menu.nameIncludes", (subString) => {
  if (subString.length > 0) {
	return Menu.find({
	  name: { $regex: subString, $options: "i" },
	});
  }
  return Menu.find();
});