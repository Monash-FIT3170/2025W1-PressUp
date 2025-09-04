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
Meteor.publish('allUsers', async function () {
  if (!this.userId) return this.ready();

  // NOTE: async on server
  const me = await Meteor.users.findOneAsync(this.userId, { fields: { isAdmin: 1 } });
  if (!me?.isAdmin) return this.ready();

  return Meteor.users.find({}, { fields: { username: 1, isAdmin: 1 } });
});