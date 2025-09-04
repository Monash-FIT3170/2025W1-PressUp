import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { RosterItemsCollection } from './rosteritem-collection';

// Publish all roster items (admin/manager access)
Meteor.publish('rosteritems.all', function () {
  // Check if user has permission to view all roster items
  if (!this.userId) {
    return this.ready();
  }
  
  return RosterItemsCollection.find({}, {
    sort: { date: 1, start_time: 1 }
  });
});

// Publish roster items for a specific employee
Meteor.publish('rosteritems.byEmployee', function (employeeId) {
  check(employeeId, String);
  
  if (!this.userId) {
    return this.ready();
  }
  
  return RosterItemsCollection.find({ employee_id: employeeId }, {
    sort: { date: 1, start_time: 1 }
  });
});

// Publish roster items for a specific date range
Meteor.publish('rosteritems.byDateRange', function (startDate, endDate) {
  check(startDate, Date);
  check(endDate, Date);
  
  if (!this.userId) {
    return this.ready();
  }
  
  return RosterItemsCollection.find({
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }, {
    sort: { date: 1, start_time: 1 }
  });
});

// Publish roster items for a specific date
Meteor.publish('rosteritems.byDate', function (date) {
  check(date, Date);
  
  if (!this.userId) {
    return this.ready();
  }
  
  return RosterItemsCollection.find({ date: date }, {
    sort: { start_time: 1 }
  });
});

// Publish roster items by status
Meteor.publish('rosteritems.byStatus', function (status) {
  check(status, String);
  
  if (!this.userId) {
    return this.ready();
  }
  
  const allowedStatuses = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'];
  if (!allowedStatuses.includes(status)) {
    return this.ready();
  }
  
  return RosterItemsCollection.find({ status: status }, {
    sort: { date: 1, start_time: 1 }
  });
});

// Publish roster items by shift type
Meteor.publish('rosteritems.byShiftType', function (shiftType) {
  check(shiftType, String);
  
  if (!this.userId) {
    return this.ready();
  }
  
  const allowedShiftTypes = ['morning', 'afternoon', 'night', 'split', 'overtime'];
  if (!allowedShiftTypes.includes(shiftType)) {
    return this.ready();
  }
  
  return RosterItemsCollection.find({ shift_type: shiftType }, {
    sort: { date: 1, start_time: 1 }
  });
});

// Publish roster items by role
Meteor.publish('rosteritems.byRole', function (role) {
  check(role, String);
  
  if (!this.userId) {
    return this.ready();
  }
  
  return RosterItemsCollection.find({ role: role }, {
    sort: { date: 1, start_time: 1 }
  });
});

// Publish roster items for current week
Meteor.publish('rosteritems.currentWeek', function () {
  if (!this.userId) {
    return this.ready();
  }
  
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // End of week (Saturday)
  endOfWeek.setHours(23, 59, 59, 999);
  
  return RosterItemsCollection.find({
    date: {
      $gte: startOfWeek,
      $lte: endOfWeek
    }
  }, {
    sort: { date: 1, start_time: 1 }
  });
});

// Publish roster items for current month
Meteor.publish('rosteritems.currentMonth', function () {
  if (!this.userId) {
    return this.ready();
  }
  
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  
  return RosterItemsCollection.find({
    date: {
      $gte: startOfMonth,
      $lte: endOfMonth
    }
  }, {
    sort: { date: 1, start_time: 1 }
  });
});

// Publish upcoming roster items (next 7 days)
Meteor.publish('rosteritems.upcoming', function () {
  if (!this.userId) {
    return this.ready();
  }
  
  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(now.getDate() + 7);
  
  return RosterItemsCollection.find({
    date: {
      $gte: now,
      $lte: endDate
    }
  }, {
    sort: { date: 1, start_time: 1 }
  });
});

// Publish today's roster items
Meteor.publish('rosteritems.today', function () {
  if (!this.userId) {
    return this.ready();
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  return RosterItemsCollection.find({
    date: {
      $gte: today,
      $lt: tomorrow
    }
  }, {
    sort: { start_time: 1 }
  });
});

// Publish roster items with search functionality
Meteor.publish('rosteritems.search', function (searchTerm) {
  check(searchTerm, String);
  
  if (!this.userId) {
    return this.ready();
  }
  
  if (searchTerm.length === 0) {
    return RosterItemsCollection.find({}, {
      sort: { date: 1, start_time: 1 }
    });
  }
  
  return RosterItemsCollection.find({
    $or: [
      { notes: { $regex: searchTerm, $options: 'i' } },
      { role: { $regex: searchTerm, $options: 'i' } },
      { shift_type: { $regex: searchTerm, $options: 'i' } }
    ]
  }, {
    sort: { date: 1, start_time: 1 }
  });
});

// Publish roster items for dashboard (limited fields for performance)
Meteor.publish('rosteritems.dashboard', function () {
  if (!this.userId) {
    return this.ready();
  }
  
  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(now.getDate() + 30); // Next 30 days
  
  return RosterItemsCollection.find({
    date: {
      $gte: now,
      $lte: endDate
    }
  }, {
    fields: {
      employee_id: 1,
      date: 1,
      start_time: 1,
      end_time: 1,
      shift_type: 1,
      role: 1,
      status: 1
    },
    sort: { date: 1, start_time: 1 },
    limit: 100 // Limit for dashboard performance
  });
});
