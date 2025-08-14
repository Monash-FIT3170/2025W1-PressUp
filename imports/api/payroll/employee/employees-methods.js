import { EmployeesCollection } from "./employees-collection";

Meteor.methods({

  async 'employees.insert'(supplierData) {

    try {
      const employeeId = await EmployeesCollection.insertAsync({
        ...supplierData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`Employee added with ID: ${employeeId}`);
      return employeeId;

    } catch (error) {
      console.error("Error inserting employee:", error);

      throw new Meteor.Error('insert-failed', 'Failed to add the employee.');
    }
  },

  async 'employees.remove'(employeeId) {

    try {
      const result = await EmployeesCollection.removeAsync(employeeId);
      console.log(`Employee removed: ${supplierId}, Removed documents: ${result}`);
    } catch (error) {
      console.error(`Error removing employee ${supplierId}:`, error);
      throw new Meteor.Error('remove-failed', 'Failed to remove the employee.');
    }
  },
  
});