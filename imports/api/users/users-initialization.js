// imports/api/users/users-initialization.js
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

export const initializeUsers = async () => {
  // Only run on server
  if (Meteor.isClient) return;
  
  const userCount = await Meteor.users.find().countAsync();
  
  if (userCount === 0) {
    console.log("No users found. Creating default users...");
    
    try {
      // Create admin user
      const adminId = Accounts.createUser({
        username: 'admin',
        password: 'admin123',
        isAdmin: true
      });
      
      // Immediately set admin status with direct database update
      const adminUpdate = await Meteor.users.rawCollection().updateOne(
        { _id: adminId },
        { $set: { isAdmin: true } }
      );
      console.log('Admin update result:', adminUpdate);
      
      // Create staff user
      const staffId = Accounts.createUser({
        username: 'staff',
        password: 'staff123',
      });
      
      // Set staff admin status
      const staffUpdate = await Meteor.users.rawCollection().updateOne(
        { _id: staffId },
        { $set: { isAdmin: false } }
      );
      console.log('Staff update result:', staffUpdate);
      
      // Verify the users were created correctly
      const adminUser = await Meteor.users.findOneAsync(adminId);
      const staffUser = await Meteor.users.findOneAsync(staffId);
      
      console.log("Users created successfully:");
      console.log("- Admin:", adminUser?.username, "isAdmin:", adminUser?.isAdmin);
      console.log("- Staff:", staffUser?.username, "isAdmin:", staffUser?.isAdmin);
      
    } catch (error) {
      console.error('Error creating users:', error);
    }
  } else {
    // Check and fix existing users
    console.log("Checking existing users...");
    
    const users = await Meteor.users.find({}).fetchAsync();
    for (const user of users) {
      if (user.username === 'admin' && user.isAdmin !== true) {
        await Meteor.users.updateAsync(user._id, { $set: { isAdmin: true } });
        console.log('Fixed admin user');
      } else if (user.username === 'staff' && user.isAdmin !== false) {
        await Meteor.users.updateAsync(user._id, { $set: { isAdmin: false } });
        console.log('Fixed staff user');
      }
    }
  }
};