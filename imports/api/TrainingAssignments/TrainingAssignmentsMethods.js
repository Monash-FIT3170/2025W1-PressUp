import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { TrainingAssignments } from './TrainingAssignmentsCollection';
import { TrainingModules } from '../trainingModules/trainingModuleCollection';
import { EmployeesCollection } from '/imports/api/payroll/employee/employees-collection'; // adjust path if different

// Helper to resolve the current user's employeeId (you can store it at user.employee_id or user.profile.employee_id)
const getEmployeeIdForUser = async (userId) => {
  const user = await Meteor.users.findOneAsync(userId, { fields: { employee_id: 1, profile: 1 } });
  const eid = user?.employee_id ?? user?.profile?.employee_id;
  if (!Number.isInteger(eid)) {
    throw new Meteor.Error('no-employee-link', 'Your account is not linked to an employee_id');
  }
  return eid;
};

Meteor.methods({
  // Admin assigns a module to an employee (by numeric employeeId)
  async 'trainingAssignments.assign'({ employeeId, moduleId }) {
    check(employeeId, Match.Integer);
    check(moduleId, String);

    if (!this.userId) throw new Meteor.Error('not-authorized', 'You must be logged in');

    const me = await Meteor.users.findOneAsync(this.userId, { fields: { isAdmin: 1 } });
    if (!me?.isAdmin) throw new Meteor.Error('not-authorized', 'Only admins can assign modules');

    // Ensure employee exists
    const emp = await EmployeesCollection.findOneAsync({ employee_id: employeeId });
    if (!emp) throw new Meteor.Error('not-found', 'Employee not found');

    // Ensure module exists
    const mod = await TrainingModules.findOneAsync(moduleId);
    if (!mod) throw new Meteor.Error('not-found', 'Module not found');

    // Avoid duplicate "assigned" entries for same employee/module combo
    const existing = await TrainingAssignments.findOneAsync({ employeeId, moduleId, status: 'assigned' });
    if (existing) return existing._id;

    return await TrainingAssignments.insertAsync({
      employeeId,
      moduleId,
      status: 'assigned',
      assignedAt: new Date(),
    });
  },

  // Staff action: mark their assignment complete (we infer employeeId from the current user)
  async 'trainingAssignments.markComplete'({ moduleId }) {
    check(moduleId, String);
    if (!this.userId) throw new Meteor.Error('not-authorized', 'You must be logged in');

    const employeeId = await getEmployeeIdForUser(this.userId);

    const assignment = await TrainingAssignments.findOneAsync({ employeeId, moduleId });
    if (!assignment) throw new Meteor.Error('not-found', 'You do not have this module assigned');

    await TrainingAssignments.updateAsync(
      { _id: assignment._id },
      { $set: { status: 'completed', completedAt: new Date() } }
    );

    return assignment._id;
  },
});
