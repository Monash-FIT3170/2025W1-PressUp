import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { DepartmentsCollection } from './departments-collection';

// Publish all active departments
Meteor.publish('departments.all', function () {
  // Check if user has permission to view departments
  if (!this.userId) {
    return this.ready();
  }
  
  return DepartmentsCollection.find({
    is_active: true
  }, {
    sort: { level: 1, name: 1 }
  });
});

// Publish all departments (including inactive) - admin access
Meteor.publish('departments.allIncludingInactive', function () {
  // Check if user has permission to view all departments
  if (!this.userId) {
    return this.ready();
  }
  
  return DepartmentsCollection.find({}, {
    sort: { level: 1, name: 1 }
  });
});

// Publish departments by parent
Meteor.publish('departments.byParent', function (parentDepartmentId) {
  check(parentDepartmentId, String);
  
  if (!this.userId) {
    return this.ready();
  }
  
  return DepartmentsCollection.find({
    parent_department_id: parentDepartmentId,
    is_active: true
  }, {
    sort: { name: 1 }
  });
});

// Publish departments by level
Meteor.publish('departments.byLevel', function (level) {
  check(level, Number);
  
  if (!this.userId) {
    return this.ready();
  }
  
  return DepartmentsCollection.find({
    level: level,
    is_active: true
  }, {
    sort: { name: 1 }
  });
});

// Publish a single department by ID
Meteor.publish('departments.single', function (departmentId) {
  check(departmentId, String);
  
  if (!this.userId) {
    return this.ready();
  }
  
  return DepartmentsCollection.find(departmentId);
});

// Publish departments with search functionality
Meteor.publish('departments.search', function (searchTerm) {
  check(searchTerm, String);
  
  if (!this.userId) {
    return this.ready();
  }
  
  if (searchTerm.length === 0) {
    return DepartmentsCollection.find({
      is_active: true
    }, {
      sort: { level: 1, name: 1 }
    });
  }
  
  return DepartmentsCollection.find({
    is_active: true,
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { code: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } }
    ]
  }, {
    sort: { level: 1, name: 1 }
  });
});

// Publish departments for dropdown/select components (limited fields)
Meteor.publish('departments.dropdown', function () {
  if (!this.userId) {
    return this.ready();
  }
  
  return DepartmentsCollection.find({
    is_active: true
  }, {
    fields: {
      name: 1,
      code: 1,
      parent_department_id: 1,
      level: 1,
      color: 1
    },
    sort: { level: 1, name: 1 }
  });
});

// Publish department hierarchy (tree structure)
Meteor.publish('departments.hierarchy', function () {
  if (!this.userId) {
    return this.ready();
  }
  
  return DepartmentsCollection.find({
    is_active: true
  }, {
    fields: {
      name: 1,
      code: 1,
      parent_department_id: 1,
      level: 1,
      color: 1,
      manager_id: 1
    },
    sort: { level: 1, name: 1 }
  });
});

// Publish departments by manager
Meteor.publish('departments.byManager', function (managerId) {
  check(managerId, String);
  
  if (!this.userId) {
    return this.ready();
  }
  
  return DepartmentsCollection.find({
    manager_id: managerId,
    is_active: true
  }, {
    sort: { name: 1 }
  });
});
