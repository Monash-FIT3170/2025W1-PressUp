import { Meteor } from 'meteor/meteor';
import { SuppliersCollection } from './SuppliersCollection.js'; 

Meteor.methods({

  'suppliers.insert'(supplierData) {

    try {
      const supplierId = SuppliersCollection.insertAsync({
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

  'suppliers.remove'(supplierId) {

    try {
      const result = SuppliersCollection.remove(supplierId);
      console.log(`Supplier removed: ${supplierId}, Removed documents: ${result}`);
    } catch (error) {
      console.error(`Error removing supplier ${supplierId}:`, error);
      throw new Meteor.Error('remove-failed', 'Failed to remove the supplier.');
    }
  },
});