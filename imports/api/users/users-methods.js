// imports/api/users/users-methods.js
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';

Meteor.methods({
  'users.create'({ username, password, isAdmin = false }) {
    check(username, String);
    check(password, String);
    check(isAdmin, Boolean);

    // Only admins can create new users (or if no users exist yet)
    const currentUser = Meteor.user();
    const userCount = Meteor.users.find().count();
    
    if (userCount > 0 && (!currentUser || !currentUser.isAdmin)) {
      throw new Meteor.Error('not-authorized', 'Only admins can create new users');
    }

    // Create the user
    const userId = Accounts.createUser({
      username,
      password,
    });

    // Set admin status
    Meteor.users.update(userId, {
      $set: { isAdmin }
    });

    return userId;
  },

  'users.updateAdminStatus'({ userId, isAdmin }) {
    check(userId, String);
    check(isAdmin, Boolean);

    // Only admins can change admin status
    const currentUser = Meteor.user();
    if (!currentUser || !currentUser.isAdmin) {
      throw new Meteor.Error('not-authorized', 'Only admins can change admin status');
    }

    return Meteor.users.update(userId, {
      $set: { isAdmin }
    });
  },

  'users.remove'(userId) {
    check(userId, String);

    // Only admins can remove users
    const currentUser = Meteor.user();
    if (!currentUser || !currentUser.isAdmin) {
      throw new Meteor.Error('not-authorized', 'Only admins can remove users');
    }

    // Prevent removing the last admin
    const adminCount = Meteor.users.find({ isAdmin: true }).count();
    const userToRemove = Meteor.users.findOne(userId);
    
    if (userToRemove?.isAdmin && adminCount <= 1) {
      throw new Meteor.Error('last-admin', 'Cannot remove the last admin user');
    }

    return Meteor.users.remove(userId);
  },

  'users.setAdminStatus'(username, isAdmin) {
    // Only run on server
    if (Meteor.isClient) return;
    
    check(username, String);
    check(isAdmin, Boolean);
    
    const user = Meteor.users.findOne({ username });
    if (!user) {
      throw new Meteor.Error('user-not-found', `User ${username} not found`);
    }
    
    const result = Meteor.users.update(user._id, {
      $set: { isAdmin: isAdmin }
    });
    
    console.log(`Set ${username} isAdmin to ${isAdmin}. Result:`, result);
    
    // Verify the update
    const updatedUser = Meteor.users.findOne(user._id);
    console.log('Updated user:', updatedUser);
    
    return {
      success: result === 1,
      username: updatedUser.username,
      isAdmin: updatedUser.isAdmin
    };
  }
});