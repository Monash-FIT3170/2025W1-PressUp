import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Promotions } from './promotions-collection';

Meteor.methods({
    'promotions.insert'(data) {
      check(data, {
        code: Match.Maybe(String), // Optional
        type: Match.OneOf('flat', 'percentage'),
        amount: Number,
        scope: {
          type: Match.OneOf('all', 'category', 'item'),
          value: Match.Maybe(String) // Required if not "all"
        },
        requiresCode: Boolean,
        expiresAt: Date
      });
  
      return Promotions.insert({
        ...data,
        isActive: true,
        createdAt: new Date()
      });
    },
  

  'promotions.getActive'() {
    const now = new Date();
    return Promotions.find({
      isActive: true,
      expiresAt: { $gte: now }
    }).fetch();
  },

  'promotions.validateCode'(code, itemId, itemCategory) {
    check(code, String);
    check(itemId, String);
    check(itemCategory, String);

    const now = new Date();
    const promo = Promotions.findOne({
      code,
      requiresCode: true,
      isActive: true,
      expiresAt: { $gte: now }
    });

    if (!promo) return null;

    // Check if it applies to the item
    const { scope } = promo;

    if (
      scope.type === 'all' ||
      (scope.type === 'category' && scope.value === itemCategory) ||
      (scope.type === 'item' && scope.value === itemId)
    ) {
      return promo;
    }

    return null;
  },


  'promotions.toggleActive'(promotionId, status) {
    check(promotionId, String);
    check(status, Boolean);
    return Promotions.update(promotionId, { $set: { isActive: status } });
  },

  'promotions.getApplicableToItem'(itemId, itemCategory) {
  check(itemId, String);
  check(itemCategory, String);

  const now = new Date();

  return Promotions.find({
    requiresCode: false,
    isActive: true,
    expiresAt: { $gte: now },
    $or: [
      { 'scope.type': 'all' },
      { 'scope.type': 'category', 'scope.value': itemCategory },
      { 'scope.type': 'item', 'scope.value': itemId }
    ]
  }).fetch();
}
});
