import { DepartmentsCollection } from "./departments-collection";
import { check } from 'meteor/check';

Meteor.methods({

  /**
   * Insert a new department
   */
  async 'departments.insert'(departmentData) {
    check(departmentData, Object);
    
    try {
      // Validate required fields
      if (!departmentData.name) {
        throw new Meteor.Error('validation-error', 'Department name is required');
      }

      // Check for duplicate department names
      const existingDepartment = await DepartmentsCollection.findOneAsync({
        name: departmentData.name,
        is_active: true
      });

      if (existingDepartment) {
        throw new Meteor.Error('duplicate-error', 'A department with this name already exists');
      }

      // Check for duplicate department codes if provided
      if (departmentData.code) {
        const existingCode = await DepartmentsCollection.findOneAsync({
          code: departmentData.code,
          is_active: true
        });

        if (existingCode) {
          throw new Meteor.Error('duplicate-error', 'A department with this code already exists');
        }
      }

      const departmentId = await DepartmentsCollection.insertAsync({
        name: departmentData.name,
        code: departmentData.code || null,
        description: departmentData.description || '',
        parent_department_id: departmentData.parent_department_id || null,
        manager_id: departmentData.manager_id || null,
        level: departmentData.level || 1,
        color: departmentData.color || null,
        budget: departmentData.budget || null,
        is_active: departmentData.is_active !== undefined ? departmentData.is_active : true,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: this.userId,
        updated_by: this.userId
      });

      console.log(`Department added with ID: ${departmentId}`);
      return departmentId;

    } catch (error) {
      console.error("Error inserting department:", error);
      throw new Meteor.Error('insert-failed', 'Failed to add the department.');
    }
  },

  /**
   * Update an existing department
   */
  async 'departments.update'(departmentId, updateData) {
    check(departmentId, String);
    check(updateData, Object);
    
    try {
      // Check if department exists
      const existingDepartment = await DepartmentsCollection.findOneAsync(departmentId);
      if (!existingDepartment) {
        throw new Meteor.Error('not-found', 'Department not found');
      }

      // Check for duplicate department names (excluding current department)
      if (updateData.name) {
        const duplicateDepartment = await DepartmentsCollection.findOneAsync({
          _id: { $ne: departmentId },
          name: updateData.name,
          is_active: true
        });

        if (duplicateDepartment) {
          throw new Meteor.Error('duplicate-error', 'A department with this name already exists');
        }
      }

      // Check for duplicate department codes (excluding current department)
      if (updateData.code) {
        const duplicateCode = await DepartmentsCollection.findOneAsync({
          _id: { $ne: departmentId },
          code: updateData.code,
          is_active: true
        });

        if (duplicateCode) {
          throw new Meteor.Error('duplicate-error', 'A department with this code already exists');
        }
      }

      const result = await DepartmentsCollection.updateAsync(departmentId, {
        $set: {
          ...updateData,
          updated_at: new Date(),
          updated_by: this.userId
        }
      });

      console.log(`Department updated: ${departmentId}`);
      return result;

    } catch (error) {
      console.error(`Error updating department ${departmentId}:`, error);
      throw new Meteor.Error('update-failed', 'Failed to update the department.');
    }
  },

  /**
   * Remove a department (soft delete by setting is_active to false)
   */
  async 'departments.remove'(departmentId) {
    check(departmentId, String);
    
    try {
      // Check if department exists
      const existingDepartment = await DepartmentsCollection.findOneAsync(departmentId);
      if (!existingDepartment) {
        throw new Meteor.Error('not-found', 'Department not found');
      }

      // Check if department has child departments
      const childDepartments = await DepartmentsCollection.findAsync({
        parent_department_id: departmentId,
        is_active: true
      });

      if (childDepartments.count() > 0) {
        throw new Meteor.Error('has-children', 'Cannot delete department with child departments');
      }

      // Soft delete by setting is_active to false
      const result = await DepartmentsCollection.updateAsync(departmentId, {
        $set: {
          is_active: false,
          updated_at: new Date(),
          updated_by: this.userId
        }
      });

      console.log(`Department removed (soft delete): ${departmentId}`);
      return result;

    } catch (error) {
      console.error(`Error removing department ${departmentId}:`, error);
      throw new Meteor.Error('remove-failed', 'Failed to remove the department.');
    }
  },

  /**
   * Hard delete a department (permanent removal)
   */
  async 'departments.hardDelete'(departmentId) {
    check(departmentId, String);
    
    try {
      const result = await DepartmentsCollection.removeAsync(departmentId);
      console.log(`Department permanently deleted: ${departmentId}, Removed documents: ${result}`);
      return result;

    } catch (error) {
      console.error(`Error permanently deleting department ${departmentId}:`, error);
      throw new Meteor.Error('delete-failed', 'Failed to permanently delete the department.');
    }
  },

  /**
   * Get all active departments
   */
  async 'departments.getAll'() {
    try {
      const departments = await DepartmentsCollection.findAsync({
        is_active: true
      }, {
        sort: { level: 1, name: 1 }
      });
      
      return departments.fetch();
    } catch (error) {
      console.error('Error getting all departments:', error);
      throw new Meteor.Error('fetch-failed', 'Failed to fetch departments.');
    }
  },

  /**
   * Get departments by parent
   */
  async 'departments.getByParent'(parentDepartmentId) {
    check(parentDepartmentId, String);
    
    try {
      const departments = await DepartmentsCollection.findAsync({
        parent_department_id: parentDepartmentId,
        is_active: true
      }, {
        sort: { name: 1 }
      });
      
      return departments.fetch();
    } catch (error) {
      console.error(`Error getting departments for parent ${parentDepartmentId}:`, error);
      throw new Meteor.Error('fetch-failed', 'Failed to fetch child departments.');
    }
  },

  /**
   * Get department hierarchy (tree structure)
   */
  async 'departments.getHierarchy'() {
    try {
      const departments = await DepartmentsCollection.findAsync({
        is_active: true
      }, {
        sort: { level: 1, name: 1 }
      });
      
      return departments.fetch();
    } catch (error) {
      console.error('Error getting department hierarchy:', error);
      throw new Meteor.Error('fetch-failed', 'Failed to fetch department hierarchy.');
    }
  }
});
