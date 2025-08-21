import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { LoyaltySettingsCollection } from "./loyalty-settings-collection.js";

Meteor.methods({
  // Get current loyalty settings
  async "loyaltySettings.get"() {
    const settings = await LoyaltySettingsCollection.findOneAsync({});
    
    // Return default settings if none exist
    if (!settings) {
      const defaultSettings = {
        fivePercent: 10,
        tenPercent: 20,
        fifteenPercent: 30,
        twentyPercent: 40,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await LoyaltySettingsCollection.insertAsync(defaultSettings);
      return defaultSettings;
    }
    
    return settings;
  },

  // Update loyalty settings
  async "loyaltySettings.update"(newSettings) {
    check(newSettings, {
      fivePercent: Number,
      tenPercent: Number,
      fifteenPercent: Number,
      twentyPercent: Number
    });

    // Validate that the settings make sense (higher discounts require more points)
    if (newSettings.fivePercent >= newSettings.tenPercent ||
        newSettings.tenPercent >= newSettings.fifteenPercent ||
        newSettings.fifteenPercent >= newSettings.twentyPercent) {
      throw new Meteor.Error(
        'invalid-settings',
        'Higher discount percentages must require more loyalty points'
      );
    }

    // Check if any settings document exists
    const existingSettings = await LoyaltySettingsCollection.findOneAsync({});
    
    const settingsData = {
      ...newSettings,
      updatedAt: new Date()
    };

    if (existingSettings) {
      // Update existing settings
      await LoyaltySettingsCollection.updateAsync(
        existingSettings._id,
        { $set: settingsData }
      );
    } else {
      // Create new settings document
      settingsData.createdAt = new Date();
      await LoyaltySettingsCollection.insertAsync(settingsData);
    }

    return settingsData;
  }
});