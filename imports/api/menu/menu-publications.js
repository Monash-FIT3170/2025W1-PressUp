import { Meteor } from 'meteor/meteor';
import { Menu } from './menu-collection';

Meteor.publish('menuItems.all', function () {
	return Menu.find({}, {
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
	return Menu.find({ menuCategory: menuCategory }, {
		fields: { name: 1, price: 1, available: 1 }
	});
});

Meteor.publish("menuItems.id", function(myId) {
	console.log(myId)
	return Menu.find({_id:myId});
  });

Meteor.publish('menuItems.isCalled', (itemName) => {
	if (itemName.length > 0) {
		return Menu.find({
		  name: itemName,
		});
	  }
	  return Menu.find();
});

Meteor.publish("menuItems.nameIncludes", (subString) => {
  if (subString.length > 0) {
	return Menu.find({
	  name: { $regex: subString, $options: "i" },
	});
  }
  return Menu.find();
});