import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { CustomersCollection } from "./CustomersCollection.js";

Meteor.methods({
  // Create a new customer
  "customers.insert"(customerData) {
    check(customerData, {
      name: String,
      email: Match.Optional(String),
      phone: Match.Optional(String),
    });

    // Check for duplicate email if provided
    if (customerData.email) {
      const existingCustomer = CustomersCollection.findOne({ 
        email: { $regex: new RegExp(`^${customerData.email}$`, 'i') } 
      });
      
      if (existingCustomer) {
        throw new Meteor.Error("duplicate-email", "A customer with this email already exists");
      }
    }

    // Validate against schema
    CustomersCollection.schema.validate(customerData);

    // Insert the customer
    const customerId = CustomersCollection.insert({
      ...customerData,
      loyaltyPoints: 0, // Start with 0 points
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return customerId;
  },

  // Update customer information
  "customers.update"(customerId, updateData) {
    check(customerId, String);
    check(updateData, {
      name: Match.Optional(String),
      email: Match.Optional(String),
      phone: Match.Optional(String),
    });

    const customer = CustomersCollection.findOne(customerId);
    if (!customer) {
      throw new Meteor.Error("customer-not-found", "Customer not found");
    }

    // Check for duplicate email if email is being updated
    if (updateData.email && updateData.email !== customer.email) {
      const existingCustomer = CustomersCollection.findOne({ 
        email: { $regex: new RegExp(`^${updateData.email}$`, 'i') },
        _id: { $ne: customerId }
      });
      
      if (existingCustomer) {
        throw new Meteor.Error("duplicate-email", "A customer with this email already exists");
      }
    }

    // Validate partial update against schema
    const updateFields = { ...updateData, updatedAt: new Date() };
    
    // Validate the update
    Object.keys(updateFields).forEach(key => {
      if (key !== 'updatedAt' && CustomersCollection.schema._schema[key]) {
        CustomersCollection.schema._schema[key].validate(updateFields[key]);
      }
    });

    CustomersCollection.update(customerId, {
      $set: updateFields
    });

    return customerId;
  },

  // Update loyalty points
  "customers.updateLoyaltyPoints"(customerId, pointsToAdd) {
    check(customerId, String);
    check(pointsToAdd, Number);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in to update loyalty points");
    }

    const customer = CustomersCollection.findOne(customerId);
    if (!customer) {
      throw new Meteor.Error("customer-not-found", "Customer not found");
    }

    const newPoints = Math.max(0, customer.loyaltyPoints + pointsToAdd); // Don't allow negative points

    CustomersCollection.update(customerId, {
      $set: {
        loyaltyPoints: newPoints,
        updatedAt: new Date()
      }
    });

    return newPoints;
  },

  // Set loyalty points to specific value
  "customers.setLoyaltyPoints"(customerId, points) {
    check(customerId, String);
    check(points, Number);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in to set loyalty points");
    }

    if (points < 0) {
      throw new Meteor.Error("invalid-points", "Loyalty points cannot be negative");
    }

    const customer = CustomersCollection.findOne(customerId);
    if (!customer) {
      throw new Meteor.Error("customer-not-found", "Customer not found");
    }

    CustomersCollection.update(customerId, {
      $set: {
        loyaltyPoints: points,
        updatedAt: new Date()
      }
    });

    return points;
  },

  // Delete a customer
  "customers.remove"(customerId) {
    check(customerId, String);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in to remove customers");
    }

    const customer = CustomersCollection.findOne(customerId);
    if (!customer) {
      throw new Meteor.Error("customer-not-found", "Customer not found");
    }

    CustomersCollection.remove(customerId);
    return true;
  },

  // Find customer by email (for signup form validation)
  "customers.findByEmail"(email) {
    check(email, String);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in to search customers");
    }

    const customer = CustomersCollection.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') } 
    });

    return customer ? { exists: true, customerId: customer._id } : { exists: false };
  },

  // Get customer count (for admin dashboard)
  "customers.getCount"() {
    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in to get customer count");
    }

    return CustomersCollection.find().count();
  }
});