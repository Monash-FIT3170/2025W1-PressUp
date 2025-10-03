import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { EmployeesCollection } from "/imports/api/payroll/employee/employees-collection";

const createUser = async (username, password, isAdmin, employee_id) => {
  await Accounts.createUserAsync({ username, password });
  await Meteor.users.updateAsync({ username }, { $set: { isAdmin, employee_id } });
};

export const initializeUsers = async () => {
  if (Meteor.isClient) return;

  const userCount = await Meteor.users.find().countAsync();
  if (userCount === 0) {
    // Seed employees
    const now = new Date();
    const adminEmpId = 1001;
    const staffEmpId = 1002;

    await EmployeesCollection.insertAsync({
      employee_id: adminEmpId,
      first_name: "Ada",
      last_name: "Admin",
      dob: new Date('1990-01-01'),
      address: "1 Admin St",
      email: "ada.admin@example.com",
      phone: "0400 000 001",
      start_date: now,
      employement_type: "full-time",
      roles: ["admin"],
    });

    await EmployeesCollection.insertAsync({
      employee_id: staffEmpId,
      first_name: "Sam",
      last_name: "Staff",
      dob: new Date('1992-02-02'),
      address: "2 Staff Rd",
      email: "sam.staff@example.com",
      phone: "0400 000 002",
      start_date: now,
      employement_type: "part-time",
      roles: ["staff"],
    });

    // Seed users and link employee_id
    await createUser("admin", "admin123", true, adminEmpId);
    await createUser("staff", "staff123", false, staffEmpId);
  }
};
