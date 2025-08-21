import { Mongo } from "meteor/mongo";
import SimpleSchema from "simpl-schema";

export const LoyaltySettingsCollection = new Mongo.Collection("loyaltySettings");

LoyaltySettingsCollection.schema = new SimpleSchema({
  fivePercent: { 
    type: Number, 
    min: 0,
    defaultValue: 10
  },
  tenPercent: { 
    type: Number, 
    min: 0,
    defaultValue: 20
  },
  fifteenPercent: { 
    type: Number, 
    min: 0,
    defaultValue: 30
  },
  twentyPercent: { 
    type: Number, 
    min: 0,
    defaultValue: 40
  },
  createdAt: { 
    type: Date, 
    defaultValue: () => new Date() 
  },
  updatedAt: { 
    type: Date, 
    defaultValue: () => new Date() 
  }
});