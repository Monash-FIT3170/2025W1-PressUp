import { Meteor } from 'meteor/meteor';
import { PromotionsCollection } from './promotions-collection';

Meteor.publish('promotions.activePublic', function () {
    return PromotionsCollection.find({
      isActive: true,
      requiresCode: false,
      expiresAt: { $gte: new Date() }
    });
  });
  