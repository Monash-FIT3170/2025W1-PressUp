import { Meteor } from 'meteor/meteor';
import { TablesCollection } from './TablesCollection.js'; 

Meteor.methods({

  async 'tables.insert'(tableData) {

    try {
      const tableId = await TablesCollection.insertAsync(
        tableData
    );

      console.log(`Table added with ID: ${tableId}`);
      return tableId;

    } catch (error) {
      console.error("Error inserting table:", error);

      throw new Meteor.Error('insert-failed', 'Failed to add the table.');
    }
  },

  async 'tables.updateStatus'(tableNumber, newStatus) {
    try {
    TablesCollection.updateAsync({table_number: tableNumber}, { $set: { table_status: newStatus } });
    } catch (error) {
      console.error(`Error updating table status for table ${tableNumber}:`, error);
      throw new Meteor.Error('updateStatus-failed', 'Failed to update the availability.');
    }
  },

  async 'tables.remove'(tableNumber) {

    try {
      const result = await TablesCollection.removeAsync({table_number: tableNumber});
      console.log(`Table removed: ${tableNumber}, Removed documents: ${result}`);
    } catch (error) {
      console.error(`Error removing table ${tableNumber}:`, error);
      throw new Meteor.Error('remove-failed', 'Failed to remove the table.');
    }
  },

  'tables.updateLayout'(tableNumber, newX, newY, newWidth, newHeight, newRotation) {
    const result = TablesCollection.updateAsync({table_number: tableNumber}, {
      $set: {
        table_xpos: newX,
        table_ypos: newY,
        table_width: newWidth,
        table_height: newHeight,
        table_rotation: newRotation,
      },
    });

    console.log(`Table updated: ${tableNumber}`);

  }
});