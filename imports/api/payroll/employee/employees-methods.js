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
      console.log(`Employee removed: ${employeeId}, Removed documents: ${result}`);
      return result;
    } catch (error) {
      console.error(`Error removing employee ${employeeId}:`, error);
      throw new Meteor.Error('remove-failed', 'Failed to remove the employee.');
    }
  },

  async 'employees.update'(employeeId, updateData) {
    try {
      // Validate that the employee exists
      const existingEmployee = await EmployeesCollection.findOneAsync(employeeId);
      if (!existingEmployee) {
        throw new Meteor.Error('not-found', 'Employee not found.');
      }

      // Prepare update data with timestamp
      const updateFields = {
        ...updateData,
        updatedAt: new Date(),
      };

      // Remove any undefined or null values to prevent overwriting with empty data
      Object.keys(updateFields).forEach(key => {
        if (updateFields[key] === undefined || updateFields[key] === null) {
          delete updateFields[key];
        }
      });

      const result = await EmployeesCollection.updateAsync(employeeId, {
        $set: updateFields
      });

      console.log(`Employee updated: ${employeeId}, Modified documents: ${result}`);
      return result;

    } catch (error) {
      console.error(`Error updating employee ${employeeId}:`, error);
      
      if (error.error === 'not-found') {
        throw error; // Re-throw validation errors
      }
      
      throw new Meteor.Error('update-failed', 'Failed to update the employee.');
    }
  },
  
});