import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";

const createUser = async (username, password, isAdmin) => {
  await Accounts.createUserAsync({ username, password });
  await Meteor.users.updateAsync({ username: username }, { $set: { isAdmin } });
};

export const initializeUsers = async () => {
  if (Meteor.isClient) return;

  const userCount = await Meteor.users.find().countAsync();

  if (userCount === 0) {
    try {
      await createUser("admin", "admin123", true);
      await createUser("staff", "staff123", false);
      console.log("Default users created");
    } catch (error) {
      console.error("Error creating users:", error);
    }
  }
};
