import { Meteor } from 'meteor/meteor';
import { TrainingAssignments } from './TrainingAssignmentsCollection';
import { EmployeesCollection } from '/imports/api/payroll/employee/employees-collection';

// Async helper: read employee_id from user doc
const readEmployeeIdAsync = async (uid) => {
  const u = await Meteor.users.findOneAsync(
    uid,
    { fields: { employee_id: 1, 'profile.employee_id': 1 } }
  );
  if (Number.isInteger(u?.employee_id)) return u.employee_id;
  if (Number.isInteger(u?.profile?.employee_id)) return u.profile.employee_id;
  return null;
};

// Current user's assignments (by employeeId)
Meteor.publish('trainingAssignments.mine', async function () {
  if (!this.userId) return this.ready();
  const employeeId = await readEmployeeIdAsync(this.userId);
  if (!Number.isInteger(employeeId)) return this.ready();
  return TrainingAssignments.find({ employeeId });
});

// Admin: all assignments
Meteor.publish('trainingAssignments.all', async function () {
  if (!this.userId) return this.ready();
  const me = await Meteor.users.findOneAsync(this.userId, { fields: { isAdmin: 1 } });
  if (!me?.isAdmin) return this.ready();
  return TrainingAssignments.find({});
});

// Employees list for admin picker
Meteor.publish('employees.all', async function () {
  if (!this.userId) return this.ready();
  const me = await Meteor.users.findOneAsync(this.userId, { fields: { isAdmin: 1 } });
  if (!me?.isAdmin) return this.ready();
  return EmployeesCollection.find(
    {},
    { fields: { employee_id: 1, first_name: 1, last_name: 1, email: 1 } }
  );
});
