import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { PromotionsCollection } from './promotions-collection';
import { MenuCategories } from '/imports/api/menu-categories/menu-categories-collection.js';

Meteor.methods({
    async 'promotions.insert'(data) {
      check(data, {
        name: String,
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

  'promotions.validateCode'(code, itemName, itemCategory) {
    check(code, String);
    check(itemName, String);
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
      (scope.type === 'item' && scope.value === itemName)
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

  'promotions.getApplicableToItem'(itemName, itemCategory) {
  check(itemName, String);
  check(itemCategory, String);

  const now = new Date();

  return PromotionsCollection.find({
    requiresCode: false,
    isActive: true,
    expiresAt: { $gte: now },
    $or: [
      { 'scope.type': 'all' },
      { 'scope.type': 'category', 'scope.value': itemCategory },
      { 'scope.type': 'item', 'scope.value': itemName }
    ]
  }).fetch();
  },

  async 'promotions.getDiscountedPrice'(itemName, itemCategory, basePrice, promoCode = null) {
    check(itemName, String);
    check(itemCategory, String);
    check(basePrice, Number);
    check(promoCode, Match.Maybe(String));
  
    const now = new Date();

    const menuCategoryDoc = await MenuCategories.findOneAsync({ _id: itemCategory });
    const categoryName = menuCategoryDoc?.category;
  
    let applicablePromos = [];
  
    // 1. Check for auto promotions (only if no promo code provided)
    if (!promoCode) {
      const autoPromos = await PromotionsCollection.find({
        requiresCode: false,
        isActive: true,
        expiresAt: { $gte: now },
        $or: [
          { 'scope.type': 'all' },
          { 'scope.type': 'category', 'scope.value': categoryName },
          { 'scope.type': 'item', 'scope.value': itemName }
        ]
      }).fetch();
  
      applicablePromos = Array.isArray(autoPromos) ? autoPromos : [];
    } else {
      // 2. Check promo code (if given)
      const codePromo = await PromotionsCollection.findOneAsync({
        code: promoCode,
        requiresCode: true,
        isActive: true,
        expiresAt: { $gte: now },
        $or: [
          { 'scope.type': 'all' },
          { 'scope.type': 'category', 'scope.value': categoryName },
          { 'scope.type': 'item', 'scope.value': itemName }
        ]
      });
  
      if (codePromo) {
        applicablePromos = [codePromo];
      } else {
        return { finalPrice: basePrice, discount: 0, appliedPromotion: null };
      }
    }
  
    if (applicablePromos.length === 0) {
      return { finalPrice: basePrice, discount: 0, appliedPromotion: null };
    }
  
    // 3. Choose the best promo (highest discount)
    let bestPromo = null;
    let maxDiscount = 0;
  
    for (const promo of applicablePromos) {
      let discount = 0;
      if (promo.type === 'flat') {
        discount = promo.amount;
      } else if (promo.type === 'percentage') {
        discount = (promo.amount / 100) * basePrice;
      }
  
      if (discount > maxDiscount) {
        maxDiscount = discount;
        bestPromo = promo;
      }
    }
  
    const finalPrice = Math.max(basePrice - maxDiscount, 0);
    return { finalPrice, discount: maxDiscount, appliedPromotion: bestPromo?.name || null };
  }  
});
