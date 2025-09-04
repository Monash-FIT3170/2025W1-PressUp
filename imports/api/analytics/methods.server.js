// imports/api/analytics/methods.server.js
import { Meteor } from 'meteor/meteor';
import { OrdersCollection } from '../orders/orders-collection'; // adjust path if needed

// Common match-builder for {status, createdAt}
function buildMatch({ onlyClosed = false, start = null, end = null } = {}) {
  const match = {};
  if (onlyClosed) match.status = 'closed';
  if (start || end) {
    match.createdAt = {};
    if (start) match.createdAt.$gte = new Date(start);
    if (end)   match.createdAt.$lte = new Date(end);
  }
  return match;
}

Meteor.methods({
  // ─────────────────────────────────────────────────────────────────────────────
  // Category counts — now supports { start, end }
  // ─────────────────────────────────────────────────────────────────────────────
  async 'analytics.categoryCounts'({ onlyClosed = false, start = null, end = null } = {}) {
    const raw = OrdersCollection.rawCollection();
    const match = buildMatch({ onlyClosed, start, end });

    const pipeline = [
      ...(Object.keys(match).length ? [{ $match: match }] : []),

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
  // KPIs for cards: Orders, Revenue, Avg Order Value, Active Items
  //
  // Revenue logic:
  //   - If an order has a numeric 'total' field, we use it.
  //   - Otherwise we compute Σ(items.price * items.quantity) for that order.
  // This keeps it robust to your schema.
  // Params: { onlyClosed?, start?, end? }
  // ─────────────────────────────────────────────────────────────────────────────
  async 'analytics.kpis'({ onlyClosed = false, start = null, end = null, metric = 'sales' } = {}) {
    const raw = OrdersCollection.rawCollection();
    const match = buildMatch({ onlyClosed, start, end });

    // Per-order revenue + overall aggregation
    const kpiAgg = await raw.aggregate([
      ...(Object.keys(match).length ? [{ $match: match }] : []),

      // Compute line totals (if we need them)
      { $unwind: { path: '$items', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          totalField: '$total', // may be undefined/Null
          lineTotal: {
            $multiply: [
              { $ifNull: ['$items.price', 0] },
              { $ifNull: ['$items.quantity', 1] }
            ]
          },
          lineGross: {
            $multiply: [
              { $ifNull: ['$items.price', 0] },
              { $ifNull: ['$items.quantity', 1] }
            ]
          },
          lineCost: {
            $multiply: [
              { $ifNull: ['$items.cost', 0] },
              { $ifNull: ['$items.quantity', 1] }
            ]
          }
        }
      },

      // Sum per order; keep any order-level total if present
      {
        $group: {
          _id: '$_id',
          orderTotalField: { $max: '$totalField' }, // if 'total' exists, we’ll take it
          gross: { $sum: '$lineGross' },
          cost:    { $sum: '$lineCost' }
        }
      },

      // Coalesce: use 'total' if present, else use summed line items
      {
        $project: {
          orderRevenue: {
            $cond: [
              { $gt: ['$orderTotalField', null] }, // not null
              '$orderTotalField',
              '$lineRevenue'
            ]
          },
          gross: 1,
          cost:  1,
          profit: { $subtract: ['$gross', '$cost'] }
        }
      },

      // Aggregate across all orders in the window
      {
        $group: {
          _id: null,
          orders: { $sum: 1 },
          revenue: { $sum: { $ifNull: ['$orderRevenue', 0] } },
          totalGross:   { $sum: { $ifNull: ['$gross', 0] } },
          totalCost:    { $sum: { $ifNull: ['$cost', 0] } },
          totalProfit:  { $sum: { $ifNull: ['$profit', 0] } }
        }
      },
      {
        $project: {
          _id: 0,
          orders: 1,
          revenue: 1,
          avgOrderValue: {
            $cond: [{ $eq: ['$orders', 0] }, 0, { $divide: ['$revenue', '$orders'] }]
          },
          sales: { $round: ['$totalGross', 2] },
          cost: { $round: ['$totalCost', 2] },
          profit: { $round: ['$totalProfit', 2] }
        }
      }
    ]).toArray();

    const kpis = kpiAgg[0] ?? { orders: 0, revenue: 0, avgOrderValue: 0 };

    // Active Items = distinct items sold in the window
    const activeItemsAgg = await raw.aggregate([
      ...(Object.keys(match).length ? [{ $match: match }] : []),
      { $unwind: '$items' },
      { $group: { _id: '$items.menu_item' } },
      { $count: 'activeItems' }
    ]).toArray();

    const activeItems = activeItemsAgg[0]?.activeItems ?? 0;

    let value;
    switch (metric) {
      case 'cost': value = kpis.cost; break;
      case 'profit': value = kpis.profit; break;
      default: value = kpis.sales;
    }

    return { 
      orders: kpis.orders, 
      value,
      metric,
      activeItems
    };
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Ingredient usage total (bar chart x=ingredient, y=total used)
  // Params:
  //   onlyClosed : boolean (optional) -> filter {status: 'closed'}
  //   start, end : Date|string (optional) -> filter by createdAt
  // ─────────────────────────────────────────────────────────────────────────────
  async 'analytics.ingredientUsage'({ onlyClosed = false, start = null, end = null } = {}) {
    const raw = OrdersCollection.rawCollection();
    const match = buildMatch({ onlyClosed, start, end });

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
    const match = buildMatch({ onlyClosed, start, end });

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
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Items frequency (x=item name, y=# of occurrences in orders; also returns total quantity)
  // Params:
  //   onlyClosed : boolean (optional) -> filter {status: 'closed'}
  //   start, end : Date|string (optional) -> filter by createdAt
  // ─────────────────────────────────────────────────────────────────────────────
  async 'analytics.itemFrequency'({ onlyClosed = false, start = null, end = null } = {}) {
    const raw = OrdersCollection.rawCollection();
    const match = buildMatch({ onlyClosed, start, end });

    const pipeline = [
      ...(Object.keys(match).length ? [{ $match: match }] : []),

      { $unwind: '$items' },

      {
        $project: {
          name: '$items.menu_item',
          qty: { $ifNull: ['$items.quantity', 1] }
        }
      },

      {
        $group: {
          _id: '$name',
          occurrences: { $sum: 1 },      // how many order lines mention this item
          quantity:    { $sum: '$qty' }   // total quantity sold
        }
      },

      {
        $project: {
          _id: 0,
          itemName: '$_id',
          occurrences: 1,
          quantity: 1
        }
      },

      { $sort: { occurrences: -1, itemName: 1 } }
    ];

    return raw.aggregate(pipeline).toArray();
  },

  // ─────────────────────────────────────────────────────────────────────────────
// Sales by Product (qty, gross $, net $)  — respects { start, end, onlyClosed }
// ─────────────────────────────────────────────────────────────────────────────

  async 'analytics.salesByProduct'({ onlyClosed = false, start = null, end = null } = {}) {
    const raw = OrdersCollection.rawCollection();
    const match = (function buildMatch({ onlyClosed, start, end }) {
      const m = {};
      if (onlyClosed) m.status = 'closed';
      if (start || end) {
        m.createdAt = {};
        if (start) m.createdAt.$gte = new Date(start);
        if (end)   m.createdAt.$lte = new Date(end);
      }
      return m;
    })({ onlyClosed, start, end });

    const pipeline = [
      ...(Object.keys(match).length ? [{ $match: match }] : []),
      { $unwind: '$items' },

      // Join menu doc (to get category id/name)
      { $lookup: { from: 'menu', localField: 'items.menu_item', foreignField: 'name', as: 'mi' } },
      { $unwind: { path: '$mi', preserveNullAndEmptyArrays: true } },

      // Resolve category name if available
      { $lookup: {
          from: 'menuCategories',
          let: { catKey: { $toString: '$mi.menuCategory' } },
          pipeline: [
            { $match: { $expr: { $or: [
              { $eq: [{ $toString: '$_id' }, '$$catKey'] },
              { $eq: ['$category', '$$catKey'] }
            ]}}},
            { $project: { _id: 0, category: 1 } }
          ],
          as: 'cat'
      }},

      // Compute dollars
      { $project: {
          name: { $ifNull: ['$items.menu_item', 'Unknown'] },
          category: { $ifNull: [{ $first: '$cat.category' }, null] },
          qty: { $ifNull: ['$items.quantity', 1] },
          gross: { $multiply: [{ $ifNull: ['$items.price', 0] }, { $ifNull: ['$items.quantity', 1] }] },
          cost:  { $multiply: [{ $ifNull: ['$items.cost', 0]  }, { $ifNull: ['$items.quantity', 1] }] }
      }},

      { $group: {
          _id: '$name',
          category: { $first: '$category' },
          qtySold:  { $sum: '$qty' },
          gross:    { $sum: '$gross' },
          cost:     { $sum: '$cost' }
      }},

      { $project: {
          _id: 0,
          name: '$_id',
          category: 1,
          qtySold: 1,
          grossSales: { $round: ['$gross', 2] },
          netProfit:  { $round: [{ $subtract: ['$gross', '$cost'] }, 2] }
      }},

      { $sort: { grossSales: -1, name: 1 } }
    ];

    return raw.aggregate(pipeline).toArray();
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Sales over Time (gross $ per day) — respects { start, end, onlyClosed }
  // ─────────────────────────────────────────────────────────────────────────────
  async 'analytics.salesOverTime'({ onlyClosed = false, start = null, end = null, metric = "sales" } = {}) {
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

      { $project: {
          date: {
            $dateToString: {
              date: { $ifNull: ['$createdAt', { $toDate: '$_id' }] },
              format: '%Y-%m-%d', timezone: TZ
            }
          },
          sales: { $multiply: [{ $ifNull: ['$items.price', 0] }, { $ifNull: ['$items.quantity', 1] }] },
          cost:  { $multiply: [{ $ifNull: ['$items.cost', 0] }, { $ifNull: ['$items.quantity', 1] }] }
      }},

      {
        $group: {
          _id: '$date',
          sales: { $sum: '$sales' },
          cost: { $sum: '$cost' }
        }
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          sales: { $round: ['$sales', 2] },
          cost: { $round: ['$cost', 2] },
          profit: { $round: [{ $subtract: ['$sales', '$cost'] }, 2] }
        }
      },
      { $sort: { date: 1 } }
    ];

    return raw.aggregate(pipeline).toArray();
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Peak hours analysis (x = hour of day, y = # of orders)
  // Respects { start, end, onlyClosed }
  // ─────────────────────────────────────────────────────────────────────────────
  async 'analytics.peakHours'({ onlyClosed = false, start = null, end = null } = {}) {
    const raw = OrdersCollection.rawCollection();
    const match = {};
    if (onlyClosed) match.status = 'closed';
    if (start || end) {
      match.createdAt = {};
      if (start) match.createdAt.$gte = new Date(start);
      if (end)   match.createdAt.$lte = new Date(end);
    }

    const TZ = 'Australia/Melbourne';

    const isDaily = start && end; // if we pass a range, always aggregate daily

    const pipeline = [
      ...(Object.keys(match).length ? [{ $match: match }] : []),
      {
        $project: {
          label: isDaily
            ? { $dateToString: { date: "$createdAt", format: "%Y-%m-%d", timezone: TZ } }
            : { $hour: { date: "$createdAt", timezone: TZ } }
        }
      },
      { $group: { _id: "$label", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ];

    const result = await raw.aggregate(pipeline).toArray();

    if (isDaily) {
      return result.map(r => ({
        date: r._id, // YYYY-MM-DD
        count: r.count
      }));
    } else {
      return result.map(r => ({
        hour: r._id, // 0–23
        count: r.count
      }));
    }
  }

});
