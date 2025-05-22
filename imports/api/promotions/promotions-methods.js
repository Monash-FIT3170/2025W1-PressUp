import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { PromotionsCollection } from './promotions-collection';

Meteor.methods({
    async 'promotions.insert'(data) {
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
  
      return await PromotionsCollection.insertAsync({
        ...data,
        isActive: true,
        createdAt: new Date()
      });
    },
  

  'promotions.getActive'() {
    const now = new Date();
    return PromotionsCollection.find({
      isActive: true,
      expiresAt: { $gte: now }
    }).fetch();
  },

  'promotions.validateCode'(code, itemId, itemCategory) {
    check(code, String);
    check(itemId, String);
    check(itemCategory, String);

    const now = new Date();
    const promo = PromotionsCollection.findOne({
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


  async 'promotions.toggleActive'(promotionId, status) {
    check(promotionId, String);
    check(status, Boolean);
    return await PromotionsCollection.updateAsync(promotionId, { $set: { isActive: status } });
  },

  'promotions.getApplicableToItem'(itemId, itemCategory) {
  check(itemId, String);
  check(itemCategory, String);

  const now = new Date();

  return PromotionsCollection.find({
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
