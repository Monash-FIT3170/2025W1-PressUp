import { RosterItemsCollection } from "./rosteritem-collection";
import { check } from 'meteor/check';

Meteor.methods({

  /**
   * Insert a new roster item
   */
  async 'rosteritems.insert'(rosterData) {
    check(rosterData, Object);
    
    try {
      // Validate required fields
      if (!rosterData.employee_id || !rosterData.date || !rosterData.start_time || 
          !rosterData.end_time || !rosterData.shift_type || !rosterData.department_id || !rosterData.role_id) {
        throw new Meteor.Error('validation-error', 'Missing required fields');
      }

      // Check for time conflicts
      const conflictCheck = await RosterItemsCollection.findOneAsync({
        employee_id: rosterData.employee_id,
        date: rosterData.date,
        $or: [
          {
            start_time: { $lt: rosterData.end_time },
            end_time: { $gt: rosterData.start_time }
          }
        ]
      });

      if (conflictCheck) {
        throw new Meteor.Error('conflict-error', 'Shift time conflicts with existing roster item');
      }

      const rosterId = await RosterItemsCollection.insertAsync({
        ...rosterData,
        status: rosterData.status || 'scheduled',
        break_duration: rosterData.break_duration || 0,
        notes: rosterData.notes || '',
        created_at: new Date(),
        updated_at: new Date(),
        created_by: this.userId,
        updated_by: this.userId
      });

      console.log(`Roster item added with ID: ${rosterId}`);
      return rosterId;

    } catch (error) {
      console.error("Error inserting roster item:", error);
      throw new Meteor.Error('insert-failed', 'Failed to add the roster item.');
    }
  },

  /**
   * Update an existing roster item
   */
  async 'rosteritems.update'(rosterId, updateData) {
    check(rosterId, String);
    check(updateData, Object);
    
    try {
      // Check if roster item exists
      const existingRoster = await RosterItemsCollection.findOneAsync(rosterId);
      if (!existingRoster) {
        throw new Meteor.Error('not-found', 'Roster item not found');
      }

      // If updating time fields, check for conflicts
      if (updateData.start_time || updateData.end_time || updateData.date || updateData.employee_id) {
        const startTime = updateData.start_time || existingRoster.start_time;
        const endTime = updateData.end_time || existingRoster.end_time;
        const date = updateData.date || existingRoster.date;
        const employeeId = updateData.employee_id || existingRoster.employee_id;

        const conflictCheck = await RosterItemsCollection.findOneAsync({
          _id: { $ne: rosterId },
          employee_id: employeeId,
          date: date,
          $or: [
            {
              start_time: { $lt: endTime },
              end_time: { $gt: startTime }
            }
          ]
        });

        if (conflictCheck) {
          throw new Meteor.Error('conflict-error', 'Updated shift time conflicts with existing roster item');
        }
      }

      const result = await RosterItemsCollection.updateAsync(rosterId, {
        $set: {
          ...updateData,
          updated_at: new Date(),
          updated_by: this.userId
        }
      });

      console.log(`Roster item updated: ${rosterId}`);
      return result;

    } catch (error) {
      console.error(`Error updating roster item ${rosterId}:`, error);
      throw new Meteor.Error('update-failed', 'Failed to update the roster item.');
    }
  },

  /**
   * Remove a roster item
   */
  async 'rosteritems.remove'(rosterId) {
    check(rosterId, String);
    
    try {
      const result = await RosterItemsCollection.removeAsync(rosterId);
      console.log(`Roster item removed: ${rosterId}, Removed documents: ${result}`);
      return result;
    } catch (error) {
      console.error(`Error removing roster item ${rosterId}:`, error);
      throw new Meteor.Error('remove-failed', 'Failed to remove the roster item.');
    }
  },

  /**
   * Get roster items for a specific employee
   */
  async 'rosteritems.getByEmployee'(employeeId, startDate, endDate) {
    check(employeeId, String);
    check(startDate, Date);
    check(endDate, Date);
    
    try {
      const rosterItems = await RosterItemsCollection.findAsync({
        employee_id: employeeId,
        date: {
          $gte: startDate,
          $lte: endDate
        }
      }, {
        sort: { date: 1, start_time: 1 }
      });
      
      return rosterItems.fetch();
    } catch (error) {
      console.error(`Error getting roster items for employee ${employeeId}:`, error);
      throw new Meteor.Error('fetch-failed', 'Failed to fetch roster items.');
    }
  },

  /**
   * Get roster items for a specific date range
   */
  async 'rosteritems.getByDateRange'(startDate, endDate) {
    check(startDate, Date);
    check(endDate, Date);
    
    try {
      const rosterItems = await RosterItemsCollection.findAsync({
        date: {
          $gte: startDate,
          $lte: endDate
        }
      }, {
        sort: { date: 1, start_time: 1 }
      });
      
      return rosterItems.fetch();
    } catch (error) {
      console.error(`Error getting roster items for date range:`, error);
      throw new Meteor.Error('fetch-failed', 'Failed to fetch roster items.');
    }
  },

  /**
   * Update roster item status
   */
  async 'rosteritems.updateStatus'(rosterId, newStatus) {
    check(rosterId, String);
    check(newStatus, String);
    
    const allowedStatuses = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'];
    if (!allowedStatuses.includes(newStatus)) {
      throw new Meteor.Error('validation-error', 'Invalid status value');
    }
    
    try {
      const result = await RosterItemsCollection.updateAsync(rosterId, {
        $set: {
          status: newStatus,
          updated_at: new Date(),
          updated_by: this.userId
        }
      });
      
      console.log(`Roster item status updated: ${rosterId} to ${newStatus}`);
      return result;
    } catch (error) {
      console.error(`Error updating roster item status ${rosterId}:`, error);
      throw new Meteor.Error('update-failed', 'Failed to update roster item status.');
    }
  },

  /**
   * Bulk insert roster items (for weekly/monthly scheduling)
   */
  async 'rosteritems.bulkInsert'(rosterItemsArray) {
    check(rosterItemsArray, Array);
    
    try {
      const insertedIds = [];
      
      for (const rosterData of rosterItemsArray) {
        // Validate required fields
        if (!rosterData.employee_id || !rosterData.date || !rosterData.start_time || 
            !rosterData.end_time || !rosterData.shift_type || !rosterData.department || !rosterData.role) {
          throw new Meteor.Error('validation-error', 'Missing required fields in roster data');
        }

        // Check for time conflicts
        const conflictCheck = await RosterItemsCollection.findOneAsync({
          employee_id: rosterData.employee_id,
          date: rosterData.date,
          $or: [
            {
              start_time: { $lt: rosterData.end_time },
              end_time: { $gt: rosterData.start_time }
            }
          ]
        });

        if (conflictCheck) {
          throw new Meteor.Error('conflict-error', `Shift time conflicts for employee ${rosterData.employee_id} on ${rosterData.date}`);
        }

        const rosterId = await RosterItemsCollection.insertAsync({
          ...rosterData,
          status: rosterData.status || 'scheduled',
          break_duration: rosterData.break_duration || 0,
          notes: rosterData.notes || '',
          created_at: new Date(),
          updated_at: new Date(),
          created_by: this.userId,
          updated_by: this.userId
        });

        insertedIds.push(rosterId);
      }

      console.log(`Bulk inserted ${insertedIds.length} roster items`);
      return insertedIds;

    } catch (error) {
      console.error("Error bulk inserting roster items:", error);
      throw new Meteor.Error('bulk-insert-failed', 'Failed to bulk insert roster items.');
    }
  }
});
