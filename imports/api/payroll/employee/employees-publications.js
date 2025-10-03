// imports/api/payroll/employee/employees-publications.js
import { Meteor } from 'meteor/meteor';
import { EmployeesCollection } from './employees-collection';

// Admin-only: publish all employees
Meteor.publish('Employees', async function () {
  if (!this.userId) return this.ready();

  // NOTE: use findOneAsync on the server (Meteor 3+)
  const me = await Meteor.users.findOneAsync(this.userId, { fields: { isAdmin: 1 } });
  if (!me?.isAdmin) return this.ready();

  return EmployeesCollection.find();
});

// Admin-only: publish employees whose first_name includes substring (case-insensitive)
Meteor.publish('employees.nameIncludes', async function (subString = '') {
  if (!this.userId) return this.ready();

  const me = await Meteor.users.findOneAsync(this.userId, { fields: { isAdmin: 1 } });
  if (!me?.isAdmin) return this.ready();

  if (typeof subString === 'string' && subString.length > 0) {
    return EmployeesCollection.find({
      first_name: { $regex: subString, $options: 'i' },
    });
  }
  return EmployeesCollection.find();
});
