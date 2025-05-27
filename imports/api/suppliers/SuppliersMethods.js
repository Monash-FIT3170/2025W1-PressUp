import { Meteor } from 'meteor/meteor';
import { SuppliersCollection } from './SuppliersCollection.js'; 

Meteor.methods({

  async 'suppliers.insert'(supplierData) {

    try {
      const supplierId = await SuppliersCollection.insertAsync({
        ...supplierData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`Supplier added with ID: ${supplierId}`);
      return supplierId;

    } catch (error) {
      console.error("Error inserting supplier:", error);

      throw new Meteor.Error('insert-failed', 'Failed to add the supplier.');
    }
  },

  async 'suppliers.remove'(supplierId) {

    try {
      const result = await SuppliersCollection.removeAsync(supplierId);
      console.log(`Supplier removed: ${supplierId}, Removed documents: ${result}`);
    } catch (error) {
      console.error(`Error removing supplier ${supplierId}:`, error);
      throw new Meteor.Error('remove-failed', 'Failed to remove the supplier.');
    }
  },

  async 'suppliers.update'(supplierId, supplierData) {

    try {
      const updateDoc = { ...supplierData };
      if (supplierData.products && typeof supplierData.products === 'string') {
        updateDoc.products = supplierData.products.split(',').map(p => p.trim()).filter(p => p);
      }
      if (supplierData.notes && typeof supplierData.notes === 'string') {
        updateDoc.notes = supplierData.notes.split(',').map(n => n.trim()).filter(n => n);
      }

      const result = await SuppliersCollection.updateAsync(supplierId, {
        $set: {
          ...updateDoc,
          updatedAt: new Date(),
        },
      });
      console.log(`Supplier updated: ${supplierId}, Matched documents: ${result}`);
      return result; 
    } catch (error) {
      console.error(`Error updating supplier ${supplierId}:`, error);
      throw new Meteor.Error('update-failed', `Failed to update the supplier: ${error.message}`);
    }
  },
});