import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { RolesCollection } from './roles-collection';

// Publish all active roles
Meteor.publish('roles.all', function () {
  // Check if user has permission to view roles
  if (!this.userId) {
    return this.ready();
  }
  
  return RolesCollection.find({
    is_active: true
  }, {
    sort: { name: 1 }
  });
});

// Publish all roles (including inactive) - admin access
Meteor.publish('roles.allIncludingInactive', function () {
  // Check if user has permission to view all roles
  if (!this.userId) {
    return this.ready();
  }
  
  return RolesCollection.find({}, {
    sort: { name: 1 }
  });
});

// Publish roles for a specific department
Meteor.publish('roles.byDepartment', function (departmentId) {
  check(departmentId, String);
  
  if (!this.userId) {
    return this.ready();
  }
  
  return RolesCollection.find({
    department_id: departmentId,
    is_active: true
  }, {
    sort: { level: 1, name: 1 }
  });
});

// Publish roles by level
Meteor.publish('roles.byLevel', function (level) {
  check(level, Number);
  
  if (!this.userId) {
    return this.ready();
  }
  
  return RolesCollection.find({
    level: level,
    is_active: true
  }, {
    sort: { name: 1 }
  });
});

// Publish a single role by ID
Meteor.publish('roles.single', function (roleId) {
  check(roleId, String);
  
  if (!this.userId) {
    return this.ready();
  }
  
  return RolesCollection.find(roleId);
});

// Publish roles with search functionality
Meteor.publish('roles.search', function (searchTerm) {
  check(searchTerm, String);
  
  if (!this.userId) {
    return this.ready();
  }
  
  if (searchTerm.length === 0) {
    return RolesCollection.find({
      is_active: true
    }, {
      sort: { name: 1 }
    });
  }
  
  return RolesCollection.find({
    is_active: true,
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } }
    ]
  }, {
    sort: { name: 1 }
  });
});

// Publish roles for dropdown/select components (limited fields)
Meteor.publish('roles.dropdown', function () {
  if (!this.userId) {
    return this.ready();
  }
  
  return RolesCollection.find({
    is_active: true
  }, {
    fields: {
      name: 1,
      department_id: 1,
      level: 1,
      hourly_rate: 1
    },
    sort: { name: 1 }
  });
});
