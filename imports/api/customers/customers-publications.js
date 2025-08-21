import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { CustomersCollection } from "./customers-collection.js";

if (Meteor.isServer) {
  // Publish all customers (with optional limit and sort)
  Meteor.publish("customers.all", function (options = {}) {
    check(options, {
      limit: Match.Optional(Number),
      sort: Match.Optional(Object),
    });

    if (!this.userId) {
      return this.ready();
    }

    const defaultOptions = {
      limit: 100,
      sort: { createdAt: -1 }, // Most recent first
    };

    const finalOptions = { ...defaultOptions, ...options };

    return CustomersCollection.find({}, finalOptions);
  });

  // Search customers by name (starts with, includes)
  Meteor.publish("customers.searchByName", function (searchTerm, options = {}) {
    check(searchTerm, String);
    check(options, {
      limit: Match.Optional(Number),
      searchType: Match.Optional(String), // 'startsWith', 'includes', 'exact'
    });

    if (!this.userId) {
      return this.ready();
    }

    if (!searchTerm || searchTerm.trim() === "") {
      return this.ready();
    }

    const defaultOptions = {
      limit: 50,
      searchType: "includes",
    };

    const finalOptions = { ...defaultOptions, ...options };
    const trimmedTerm = searchTerm.trim();

    let nameQuery;
    switch (finalOptions.searchType) {
      case "startsWith":
        nameQuery = { $regex: new RegExp(`^${trimmedTerm}`, "i") };
        break;
      case "exact":
        nameQuery = { $regex: new RegExp(`^${trimmedTerm}$`, "i") };
        break;
      case "includes":
      default:
        nameQuery = { $regex: new RegExp(trimmedTerm, "i") };
        break;
    }

    return CustomersCollection.find(
      { name: nameQuery },
      {
        limit: finalOptions.limit,
        sort: { name: 1 },
      }
    );
  });

  // Search customers by email (starts with, includes)
  Meteor.publish(
    "customers.searchByEmail",
    function (searchTerm, options = {}) {
      check(searchTerm, String);
      check(options, {
        limit: Match.Optional(Number),
        searchType: Match.Optional(String), // 'startsWith', 'includes', 'exact'
      });

      if (!this.userId) {
        return this.ready();
      }

      if (!searchTerm || searchTerm.trim() === "") {
        return this.ready();
      }

      const defaultOptions = {
        limit: 50,
        searchType: "includes",
      };

      const finalOptions = { ...defaultOptions, ...options };
      const trimmedTerm = searchTerm.trim();

      let emailQuery;
      switch (finalOptions.searchType) {
        case "startsWith":
          emailQuery = { $regex: new RegExp(`^${trimmedTerm}`, "i") };
          break;
        case "exact":
          emailQuery = { $regex: new RegExp(`^${trimmedTerm}$`, "i") };
          break;
        case "includes":
        default:
          emailQuery = { $regex: new RegExp(trimmedTerm, "i") };
          break;
      }

      return CustomersCollection.find(
        {
          email: { $exists: true, $ne: "" },
          email: emailQuery,
        },
        {
          limit: finalOptions.limit,
          sort: { email: 1 },
        }
      );
    }
  );

  // Get single customer by ID
  Meteor.publish("customers.byId", function (customerId) {
    check(customerId, String);

    if (!this.userId) {
      return this.ready();
    }

    return CustomersCollection.find({ _id: customerId });
  });

  // Add this publication to your existing file (around line 80-90)
  Meteor.publish(
    "customers.searchByPhone",
    function (searchTerm, options = {}) {
      check(searchTerm, String);
      check(options, {
        limit: Match.Optional(Number),
        searchType: Match.Optional(String),
      });

      if (!this.userId) {
        return this.ready();
      }

      if (!searchTerm || searchTerm.trim() === "") {
        return this.ready();
      }

      const defaultOptions = {
        limit: 50,
        searchType: "includes",
      };

      const finalOptions = { ...defaultOptions, ...options };
      const cleanedTerm = searchTerm.replace(/\D/g, "");

      if (cleanedTerm === "") {
        return this.ready();
      }

      let phoneQuery = { $regex: new RegExp(cleanedTerm, "i") };

      return CustomersCollection.find(
        {
          phone: { $exists: true, $ne: "" },
          phone: phoneQuery,
        },
        {
          limit: finalOptions.limit,
          sort: { phone: 1 },
        }
      );
    }
  );
}
