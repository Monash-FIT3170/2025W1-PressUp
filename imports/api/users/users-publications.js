// imports/api/users/users-publications.js
import { Meteor } from 'meteor/meteor';

// Publish current user's data
Meteor.publish('currentUser', function() {
  if (this.userId) {
    return Meteor.users.find(
      { _id: this.userId },
      { fields: { username: 1, isAdmin: 1, createdAt: 1 } }
    );
  }
  return this.ready();
});

// Publish all users (admin only)
Meteor.publish('allUsers', function() {
  const currentUser = Meteor.users.findOne(this.userId);
  
  if (currentUser?.isAdmin) {
    return Meteor.users.find(
      {},
      { fields: { username: 1, isAdmin: 1, createdAt: 1 } }
    );
  }
  
  return this.ready();
});