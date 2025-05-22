import { Meteor } from 'meteor/meteor';
import { Promotions } from './promotions-collection';

Meteor.publish('promotions.activePublic', function () {
    return Promotions.find({
      isActive: true,
      requiresCode: false,
      expiresAt: { $gte: new Date() }
    });
  });
  