import { RolesCollection } from "./roles-collection";
import { check } from 'meteor/check';

Meteor.methods({

  /**
   * Insert a new role
   */
  async 'roles.insert'(roleData) {
    check(roleData, Object);
    
    try {
      // Validate required fields
      if (!roleData.name) {
        throw new Meteor.Error('validation-error', 'Role name is required');
      }

      // Check for duplicate role names
      const existingRole = await RolesCollection.findOneAsync({
        name: roleData.name,
        is_active: true
      });

      if (existingRole) {
        throw new Meteor.Error('duplicate-error', 'A role with this name already exists');
      }

      const roleId = await RolesCollection.insertAsync({
        name: roleData.name,
        description: roleData.description || '',
        department_id: roleData.department_id || null,
        level: roleData.level || 1,
        hourly_rate: roleData.hourly_rate || null,
        is_active: roleData.is_active !== undefined ? roleData.is_active : true,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: this.userId,
        updated_by: this.userId
      });

      console.log(`Role added with ID: ${roleId}`);
      return roleId;

    } catch (error) {
      console.error("Error inserting role:", error);
      throw new Meteor.Error('insert-failed', 'Failed to add the role.');
    }
  },

  /**
   * Update an existing role
   */
  async 'roles.update'(roleId, updateData) {
    check(roleId, String);
    check(updateData, Object);
    
    try {
      // Check if role exists
      const existingRole = await RolesCollection.findOneAsync(roleId);
      if (!existingRole) {
        throw new Meteor.Error('not-found', 'Role not found');
      }

      // Check for duplicate role names (excluding current role)
      if (updateData.name) {
        const duplicateRole = await RolesCollection.findOneAsync({
          _id: { $ne: roleId },
          name: updateData.name,
          is_active: true
        });

        if (duplicateRole) {
          throw new Meteor.Error('duplicate-error', 'A role with this name already exists');
        }
      }

      const result = await RolesCollection.updateAsync(roleId, {
        $set: {
          ...updateData,
          updated_at: new Date(),
          updated_by: this.userId
        }
      });

      console.log(`Role updated: ${roleId}`);
      return result;

    } catch (error) {
      console.error(`Error updating role ${roleId}:`, error);
      throw new Meteor.Error('update-failed', 'Failed to update the role.');
    }
  },

  /**
   * Remove a role (soft delete by setting is_active to false)
   */
  async 'roles.remove'(roleId) {
    check(roleId, String);
    
    try {
      // Check if role exists
      const existingRole = await RolesCollection.findOneAsync(roleId);
      if (!existingRole) {
        throw new Meteor.Error('not-found', 'Role not found');
      }

      // Soft delete by setting is_active to false
      const result = await RolesCollection.updateAsync(roleId, {
        $set: {
          is_active: false,
          updated_at: new Date(),
          updated_by: this.userId
        }
      });

      console.log(`Role removed (soft delete): ${roleId}`);
      return result;

    } catch (error) {
      console.error(`Error removing role ${roleId}:`, error);
      throw new Meteor.Error('remove-failed', 'Failed to remove the role.');
    }
  },

  /**
   * Hard delete a role (permanent removal)
   */
  async 'roles.hardDelete'(roleId) {
    check(roleId, String);
    
    try {
      const result = await RolesCollection.removeAsync(roleId);
      console.log(`Role permanently deleted: ${roleId}, Removed documents: ${result}`);
      return result;

    } catch (error) {
      console.error(`Error permanently deleting role ${roleId}:`, error);
      throw new Meteor.Error('delete-failed', 'Failed to permanently delete the role.');
    }
  },

  /**
   * Get all active roles
   */
  async 'roles.getAll'() {
    try {
      const roles = await RolesCollection.findAsync({
        is_active: true
      }, {
        sort: { name: 1 }
      });
      
      return roles.fetch();
    } catch (error) {
      console.error('Error getting all roles:', error);
      throw new Meteor.Error('fetch-failed', 'Failed to fetch roles.');
    }
  },

  /**
   * Get roles by department
   */
  async 'roles.getByDepartment'(departmentId) {
    check(departmentId, String);
    
    try {
      const roles = await RolesCollection.findAsync({
        department_id: departmentId,
        is_active: true
      }, {
        sort: { level: 1, name: 1 }
      });
      
      return roles.fetch();
    } catch (error) {
      console.error(`Error getting roles for department ${departmentId}:`, error);
      throw new Meteor.Error('fetch-failed', 'Failed to fetch roles for department.');
    }
  }
});
