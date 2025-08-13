// imports/api/analytics/methods.server.js
import { Meteor } from 'meteor/meteor';
import { OrdersCollection } from '../orders/orders-collection'; // adjust path if needed

Meteor.methods({
  // ─────────────────────────────────────────────────────────────────────────────
  // Category counts (existing functionality)
  // ─────────────────────────────────────────────────────────────────────────────
  async 'analytics.categoryCounts'({ onlyClosed = false } = {}) {
    const raw = OrdersCollection.rawCollection();

    const pipeline = [
      ...(onlyClosed ? [{ $match: { status: 'closed' } }] : []),

      { $unwind: '$items' },

      {
        $lookup: {
          from: 'menu',
          localField: 'items.menu_item', // order stores the menu *name*
          foreignField: 'name',          // menu docs' name
          as: 'mi'
        }
      },
      { $unwind: '$mi' },

      {
        $group: {
          _id: { $toString: '$mi.menuCategory' },
          qty: { $sum: { $ifNull: ['$items.quantity', 1] } },
          lineItems: { $sum: 1 }
        }
      },

      {
        $lookup: {
          from: 'menuCategories',
          let: { catKey: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: [{ $toString: '$_id' }, '$$catKey'] }, // ID match
                    { $eq: ['$category', '$$catKey'] }            // name match (e.g., "drinks")
                  ]
                }
              }
            },
            { $project: { _id: 0, category: 1 } }
          ],
          as: 'cat'
        }
      },

      {
        $project: {
          _id: 0,
          categoryId: '$_id',
          categoryName: { $ifNull: [{ $first: '$cat.category' }, null] },
          count: '$qty',
          lineItems: 1
        }
      },

      { $sort: { count: -1 } }
    ];

    return raw.aggregate(pipeline).toArray();
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Ingredient usage total (bar chart x=ingredient, y=total used)
  // Params:
  //   onlyClosed : boolean (optional) -> filter {status: 'closed'}
  //   start, end : Date|string (optional) -> filter by createdAt
  // ─────────────────────────────────────────────────────────────────────────────
  async 'analytics.ingredientUsage'({ onlyClosed = false, start = null, end = null } = {}) {
    const raw = OrdersCollection.rawCollection();

    const match = {};
    if (onlyClosed) match.status = 'closed';
    if (start || end) {
      match.createdAt = {};
      if (start) match.createdAt.$gte = new Date(start);
      if (end)   match.createdAt.$lte = new Date(end);
    }

    const pipeline = [
      ...(Object.keys(match).length ? [{ $match: match }] : []),

      // One row per order line
      { $unwind: '$items' },

      // Join to the menu item by *name*
      {
        $lookup: {
          from: 'menu',
          localField: 'items.menu_item',
          foreignField: 'name',
          as: 'mi'
        }
      },
      { $unwind: '$mi' },

      // One row per ingredient used by that menu item
      { $unwind: '$mi.ingredients' },

      // Compute amount used for this line: quantity * ingredient.amount
      {
        $project: {
          _id: 0,
          ingId: '$mi.ingredients.id',
          used: {
            $multiply: [
              { $ifNull: ['$items.quantity', 1] },
              { $ifNull: ['$mi.ingredients.amount', 0] }
            ]
          }
        }
      },

      // Sum per ingredient ID
      {
        $group: {
          _id: '$ingId',
          totalUsed: { $sum: '$used' }
        }
      },

      // Resolve name/units from inventory
      {
        $lookup: {
          from: 'inventory',
          localField: '_id',
          foreignField: '_id',
          as: 'inv'
        }
      },

      {
        $project: {
          _id: 0,
          ingredientId: '$_id',
          ingredientName: { $ifNull: [{ $first: '$inv.name' }, 'Unknown'] },
          units: { $first: '$inv.units' },
          used: { $round: ['$totalUsed', 3] }
        }
      },

      { $sort: { used: -1, ingredientName: 1 } }
    ];

    return raw.aggregate(pipeline).toArray();
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Ingredient usage timeseries (line chart x=date, y=used; one line per ingredient)
  // Uses the ORDER'S createdAt date (falls back to ObjectId timestamp if missing).
  // Params:
  //   onlyClosed : boolean (optional) -> filter {status: 'closed'}
  //   start, end : Date|string (optional) -> filter by createdAt
  // ─────────────────────────────────────────────────────────────────────────────
  async 'analytics.ingredientUsageTimeseries'({ onlyClosed = false, start = null, end = null } = {}) {
    const raw = OrdersCollection.rawCollection();

    const match = {};
    if (onlyClosed) match.status = 'closed';
    if (start || end) {
      match.createdAt = {};
      if (start) match.createdAt.$gte = new Date(start);
      if (end)   match.createdAt.$lte = new Date(end);
    }

    const TZ = 'Australia/Melbourne';

    const pipeline = [
      ...(Object.keys(match).length ? [{ $match: match }] : []),

      { $unwind: '$items' },

      {
        $lookup: {
          from: 'menu',
          localField: 'items.menu_item', // join by menu name stored on the order
          foreignField: 'name',
          as: 'mi'
        }
      },
      { $unwind: '$mi' },
      { $unwind: '$mi.ingredients' },

      // Use the ORDER'S DATE:
      //   - Prefer createdAt
      //   - Fallback to ObjectId timestamp if createdAt missing
      {
        $project: {
          _id: 0,
          ingId: '$mi.ingredients.id',
          date: {
            $dateToString: {
              date: { $ifNull: ['$createdAt', { $toDate: '$_id' }] },
              format: '%Y-%m-%d',
              timezone: TZ
            }
          },
          used: {
            $multiply: [
              { $ifNull: ['$items.quantity', 1] },
              { $ifNull: ['$mi.ingredients.amount', 0] }
            ]
          }
        }
      },

      // Sum per (ingredient, day)
      {
        $group: {
          _id: { ingId: '$ingId', date: '$date' },
          used: { $sum: '$used' }
        }
      },

      // Attach inventory metadata
      {
        $lookup: {
          from: 'inventory',
          localField: '_id.ingId',
          foreignField: '_id',
          as: 'inv'
        }
      },

      {
        $project: {
          _id: 0,
          date: '$_id.date',
          ingId: '$_id.ingId',
          ingredientName: { $ifNull: [{ $first: '$inv.name' }, 'Unknown'] },
          units: { $first: '$inv.units' },
          used: { $round: ['$used', 3] }
        }
      },

      { $sort: { date: 1, ingredientName: 1 } }
    ];

    return raw.aggregate(pipeline).toArray();
  }
});
