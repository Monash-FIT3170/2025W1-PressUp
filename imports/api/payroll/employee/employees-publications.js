import { Meteor } from "meteor/meteor";
import { EmployeesCollection } from "./employees-collection";

Meteor.publish("Employees", () => {
  return EmployeesCollection.find();
});

Meteor.publish("employees.nameIncludes", (subString) => {
  if (subString.length > 0) {
    return SuppliersCollection.find({
      first_name: { $regex: subString, $options: "i" },
    });
  }
  return EmployeesCollection.find();
});