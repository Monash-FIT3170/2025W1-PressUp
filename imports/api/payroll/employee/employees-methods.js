import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { check, Match } from 'meteor/check';
import { EmployeesCollection } from './employees-collection';

// Helper: next sequential employee_id (start at 1001 if none)
const nextEmployeeIdAsync = async () => {
  const last = await EmployeesCollection.findOneAsync({}, { sort: { employee_id: -1 }, fields: { employee_id: 1 } });
  return (last?.employee_id ?? 1000) + 1;
};

Meteor.methods({
  async 'employees.insert'(data) {
    if (!this.userId) throw new Meteor.Error('not-authorized');
    const me = await Meteor.users.findOneAsync(this.userId, { fields: { isAdmin: 1 } });
    if (!me?.isAdmin) throw new Meteor.Error('not-authorized');

    check(data, {
      first_name: String,
      last_name: String,
      email: String,
      phone: Match.Optional(String),
      dob: Match.OneOf(Date, null),
      address: Match.Optional(String),
      start_date: Match.OneOf(Date, null),
      employment_type: Match.Optional(String),
      roles: Match.Optional([String]),
      username: String,
      password: Match.Optional(String), // allow empty/omitted when linking
      isAdmin: Match.Optional(Boolean),
    });

    // Normalize employment type -> collection key is "employement_type"
    const employement_type = data.employment_type || 'Full-time';

    // Try to find existing user by username or email — we prefer username match
    const existingByUsername = await Meteor.users.findOneAsync({ username: data.username });
    const existingByEmail = await Meteor.users.findOneAsync({ 'emails.address': data.email });
    const existingUser = existingByUsername || existingByEmail;

    // Will hold final resolved employee_id + ids
    let employee_id;
    let employeeDocId;
    let userId;

    if (existingUser) {
      // ——— LINK PATH: keep the existing user ———
      userId = existingUser._id;

      // Use user's existing employee_id if present, otherwise assign a new one
      const existingEmployeeId =
        Number.isInteger(existingUser?.profile?.employee_id) ? existingUser.profile.employee_id : null;

      employee_id = existingEmployeeId ?? (await nextEmployeeIdAsync());

      // Ensure the user profile has employee_id set
      if (!existingEmployeeId) {
        await Meteor.users.updateAsync(userId, { $set: { 'profile.employee_id': employee_id } });
      }

      // Ensure an employee doc exists for this employee_id; if not, create one
      const employeeDoc = await EmployeesCollection.findOneAsync({ employee_id });
      if (!employeeDoc) {
        employeeDocId = await EmployeesCollection.insertAsync({
          employee_id,
          first_name: data.first_name,
          last_name: data.last_name,
          dob: data.dob || null,
          address: data.address || '',
          email: data.email,
          phone: data.phone || '',
          start_date: data.start_date || null,
          employement_type,
          roles: data.roles || [],
          createdAt: new Date(),
          updatedAt: new Date(),
          isAdmin: !!data.isAdmin,
        });
      } else {
        employeeDocId = employeeDoc._id;
      }

      // Optionally update isAdmin and password on the existing user
      const setUser = {};
      if (typeof data.isAdmin === 'boolean') setUser.isAdmin = data.isAdmin;
      if (Object.keys(setUser).length) {
        await Meteor.users.updateAsync(userId, { $set: setUser });
      }
      if (typeof data.password === 'string' && data.password.length > 0) {
        await Accounts.setPasswordAsync(userId, data.password, { logout: false });
      }
    } else {
      // ——— NEW PATH: create both employee and user ———
      employee_id = await nextEmployeeIdAsync();

      employeeDocId = await EmployeesCollection.insertAsync({
        employee_id,
        first_name: data.first_name,
        last_name: data.last_name,
        dob: data.dob || null,
        address: data.address || '',
        email: data.email,
        phone: data.phone || '',
        start_date: data.start_date || null,
        employement_type,
        roles: data.roles || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isAdmin: !!data.isAdmin,
      });

      userId = await Accounts.createUserAsync({
        username: data.username,
        email: data.email,
        password: data.password || '', // allow empty if you want to force reset later
        profile: { employee_id },
      });
      await Meteor.users.updateAsync(userId, { $set: { isAdmin: !!data.isAdmin } });
    }

    return { employeeDocId, userId, employee_id };
  },

  async 'employees.update'(employeeId, updates) {
    if (!this.userId) throw new Meteor.Error('not-authorized');
    const me = await Meteor.users.findOneAsync(this.userId, { fields: { isAdmin: 1 } });
    if (!me?.isAdmin) throw new Meteor.Error('not-authorized');

    check(employeeId, String);
    check(updates, Object);

    const existing = await EmployeesCollection.findOneAsync(employeeId);
    if (!existing) throw new Meteor.Error('not-found', 'Employee not found');

    const setFields = { ...updates, updatedAt: new Date() };
    if (updates?.employment_type) {
      setFields.employement_type = updates.employment_type;
      delete setFields.employment_type;
    }
    Object.keys(setFields).forEach(k => {
      if (setFields[k] === undefined) delete setFields[k];
    });

    // Update employee doc
    await EmployeesCollection.updateAsync(employeeId, { $set: setFields });

    // Propagate to linked user (by profile.employee_id)
    const linkedUser = await Meteor.users.findOneAsync(
      { 'profile.employee_id': existing.employee_id },
      { fields: { _id: 1 } }
    );

    if (linkedUser) {
      const setUser = {};
      if (typeof updates.isAdmin === 'boolean') setUser.isAdmin = updates.isAdmin;

      // Optional: allow username/email change safely (check uniqueness)
      if (updates.username) {
        const usernameTaken = await Meteor.users.findOneAsync(
          { _id: { $ne: linkedUser._id }, username: updates.username },
          { fields: { _id: 1 } }
        );
        if (usernameTaken) throw new Meteor.Error('username-taken', 'Username already in use');
        setUser.username = updates.username;
      }
      if (updates.email) {
        const emailTaken = await Meteor.users.findOneAsync(
          { _id: { $ne: linkedUser._id }, 'emails.address': updates.email },
          { fields: { _id: 1 } }
        );
        if (emailTaken) throw new Meteor.Error('email-taken', 'Email already in use');
        setUser['emails.0.address'] = updates.email;
      }

      if (Object.keys(setUser).length) {
        await Meteor.users.updateAsync(linkedUser._id, { $set: setUser });
      }
      if (typeof updates.password === 'string' && updates.password.length > 0) {
        await Accounts.setPasswordAsync(linkedUser._id, updates.password, { logout: false });
      }
    }

    return employeeId;
  },

  async 'employees.remove'(employeeId) {
    if (!this.userId) throw new Meteor.Error('not-authorized');

    const me = await Meteor.users.findOneAsync(this.userId, { fields: { isAdmin: 1 } });
    if (!me?.isAdmin) throw new Meteor.Error('not-authorized');

    check(employeeId, String);

    // Find the employee being removed
    const existing = await EmployeesCollection.findOneAsync(employeeId);
    if (!existing) throw new Meteor.Error('not-found', 'Employee not found');

    // Check if this employee is an admin
    const isAdminEmployee = existing.roles?.includes('Admin') || existing.roles?.includes('admin');

    if (isAdminEmployee) {
      // Count how many admin employees exist in the system
      const adminCount = await EmployeesCollection.find({
        roles: { $in: ['Admin', 'admin'] }
      }).countAsync();

      // If there's only one admin and we're trying to remove them, block it
      if (adminCount <= 1) {
        throw new Meteor.Error(
          'cannot-remove-last-admin',
          'You cannot remove the last admin user from the system.'
        );
      }
    }

    // Unlink but do NOT delete users (keeps your initial users)
    const linkedUser = await Meteor.users.findOneAsync(
      { 'profile.employee_id': existing.employee_id },
      { fields: { _id: 1 } }
    );

    await EmployeesCollection.removeAsync(employeeId);

    if (linkedUser) {
      await Meteor.users.updateAsync(linkedUser._id, { $unset: { 'profile.employee_id': 1 } });
    }

    return true;
  },
});
