import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { CustomersCollection } from "./customers-collection.js";

Meteor.methods({
  // Create a new customer
  async "customers.insert"(customerData) {
    check(customerData, {
      name: String,
      email: Match.Optional(String),
      phone: Match.Optional(String),
    });

    // Check for duplicate email if provided
    if (customerData.email) {
      const existingCustomer = await CustomersCollection.findOneAsync({
        email: { $regex: new RegExp(`^${customerData.email}$`, "i") },
      });

      if (existingCustomer) {
        throw new Meteor.Error(
          "duplicate-email",
          "A customer with this email already exists"
        );
      }
    }

    // Validate against schema
    CustomersCollection.schema.validate(customerData);

    // Insert the customer
    const customerId = await CustomersCollection.insertAsync({
      ...customerData,
      loyaltyPoints: 0, // Start with 0 points
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return customerId;
  },

  // Update customer information
  async "customers.update"(customerId, updateData) {
    check(customerId, String);
    check(updateData, {
      name: Match.Optional(String),
      email: Match.Optional(String),
      phone: Match.Optional(String),
    });

    const customer = await CustomersCollection.findOneAsync(customerId);
    if (!customer) {
      throw new Meteor.Error("customer-not-found", "Customer not found");
    }

    // Check for duplicate email if email is being updated
    if (updateData.email && updateData.email !== customer.email) {
      const existingCustomer = await CustomersCollection.findOneAsync({
        email: { $regex: new RegExp(`^${updateData.email}$`, "i") },
        _id: { $ne: customerId },
      });

      if (existingCustomer) {
        throw new Meteor.Error(
          "duplicate-email",
          "A customer with this email already exists"
        );
      }
    }

    // Validate partial update against schema
    const updateFields = { ...updateData, updatedAt: new Date() };

    // Validate the update
    Object.keys(updateFields).forEach((key) => {
      if (key !== "updatedAt" && CustomersCollection.schema._schema[key]) {
        CustomersCollection.schema._schema[key].validate(updateFields[key]);
      }
    });

    await CustomersCollection.updateAsync(customerId, {
      $set: updateFields,
    });

    return customerId;
  },

  // Update loyalty points
  async "customers.updateLoyaltyPoints"(customerId, pointsToAdd) {
    check(customerId, String);
    check(pointsToAdd, Number);

    const customer = await CustomersCollection.findOneAsync(customerId);
    if (!customer) {
      throw new Meteor.Error("customer-not-found", "Customer not found");
    }

    const newPoints = Math.max(0, customer.loyaltyPoints + pointsToAdd); // Don't allow negative points

    await CustomersCollection.updateAsync(customerId, {
      $set: {
        loyaltyPoints: newPoints,
        updatedAt: new Date(),
      },
    });

    return newPoints;
  },

  // Set loyalty points to specific value
  async "customers.setLoyaltyPoints"(customerId, points) {
    check(customerId, String);
    check(points, Number);

    if (points < 0) {
      throw new Meteor.Error(
        "invalid-points",
        "Loyalty points cannot be negative"
      );
    }

    const customer = await CustomersCollection.findOneAsync(customerId);
    if (!customer) {
      throw new Meteor.Error("customer-not-found", "Customer not found");
    }

    await CustomersCollection.updateAsync(customerId, {
      $set: {
        loyaltyPoints: points,
        updatedAt: new Date(),
      },
    });

    return points;
  },

  // Delete a customer
  async "customers.remove"(customerId) {
    check(customerId, String);

    const customer = await CustomersCollection.findOneAsync(customerId);
    if (!customer) {
      throw new Meteor.Error("customer-not-found", "Customer not found");
    }

    await CustomersCollection.removeAsync(customerId);
    return true;
  },

  // Find customer by email (for signup form validation)
  async "customers.findByEmail"(email) {
    check(email, String);

    const customer = await CustomersCollection.findOneAsync({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });

    return customer
      ? { exists: true, customerId: customer._id }
      : { exists: false };
  },

  // Get customer count (for admin dashboard)
  async "customers.getCount"() {
    const count = await CustomersCollection.find().countAsync();
    return count;
  },
});