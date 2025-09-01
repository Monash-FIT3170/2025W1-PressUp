// server/main.js
import { Meteor } from "meteor/meteor";
import { WebApp } from "meteor/webapp";

import { MenuCategories } from "/imports/api/menu-categories/menu-categories-collection";
import '/imports/api/menu-categories/menu-categories-initialise';
import '/imports/api/menu-categories/menu-categories-publications';
import '/imports/api/menu-categories/menu-categories-methods';

import { Menu } from "/imports/api/menu/menu-collection";
import "/imports/api/menu/menu-methods";
import "/imports/api/menu/menu-publications";

import { InventoryCollection } from "/imports/api/inventory/inventory-collection";
import "../imports/api/inventory/inventory-publications";
import "../imports/api/inventory/inventory-methods";

import { SuppliersCollection } from '../imports/api/suppliers/SuppliersCollection';
import "../imports/api/suppliers/SuppliersMethods";
import "../imports/api/suppliers/SuppliersPublications";

import { OrdersCollection } from "../imports/api/orders/orders-collection";
import "../imports/api/orders/orders-methods";
import "../imports/api/orders/orders-publications";
import '../imports/api/users/users-methods';
import '../imports/api/users/users-publications';

import { PromotionsCollection } from '/imports/api/promotions/promotions-collection.js';
import '/imports/api/promotions/promotions-methods.js';
import '/imports/api/promotions/promotions-publications.js';

import { TablesCollection } from '../imports/api/tables/TablesCollection';
import "../imports/api/tables/TablesMethods";
import "../imports/api/tables/TablesPublications";


import { EnquiriesCollection } from "../imports/api/enquiries/enquiries-collection";
import "../imports/api/enquiries/enquiries-methods";
import "../imports/api/enquiries/enquiries-publications";

import { FeedbackCollection } from "../imports/api/feedback/feedback-collection.js";
import "../imports/api/feedback/feedback-methods.js";
import "../imports/api/feedback/feedback-publication.js";

import { ScheduledChanges } from '/imports/api/scheduled-changes/scheduled-changes-collection.js';
import '../imports/api/scheduled-changes/scheduled-changes-methods.js';
import '../imports/api/scheduled-changes/scheduled-changes-publications.js';

import { initializeUsers } from '../imports/api/users/users-initialization';
import { scheduler } from './scheduler.js';
import { CustomersCollection } from '../imports/api/customers/customers-collection.js';
import "../imports/api/customers/customers-publications.js";
import "../imports/api/customers/customers-methods.js";

import { LoyaltySettingsCollection } from '../imports/api/loyalty/loyalty-settings-collection.js';
import "../imports/api/loyalty/loyalty-setting-methods.js";

import '/imports/api/analytics/methods.server.js';

import "/imports/api/finance/finance-methods.js";

import { TrainingModules } from '../imports/api/trainingModules/trainingModuleCollection';
import '../imports/api/trainingModules/TrainingModulesMethods';
import '../imports/api/trainingModules/trainingModulePublications';

import {TrainingAssignments} from '../imports/api/TrainingAssignments/TrainingAssignmentsCollection';
import '../imports/api/TrainingAssignments/TrainingAssignmentsMethods';
import '../imports/api/TrainingAssignments/TrainingAssignmentsPublications';

Meteor.startup(async () => {
  // Testing menu and categories.
  const nCategories = await MenuCategories.find().countAsync();
  const nMenuItems = await Menu.find().countAsync();
  const nIngredients = await InventoryCollection.find().countAsync();
  const nSuppliers = await SuppliersCollection.find().countAsync();
  const nOrders = await OrdersCollection.find().countAsync();
  const nPromotions = await PromotionsCollection.find().countAsync();
  const nTrainingModules = await TrainingModules.find().countAsync();
  // Ignore any changes that have been applied.
  const nScheduledChanges = await ScheduledChanges.find({
    applied: { $ne: true } 
  }).countAsync();

  await initializeUsers();
  const nCustomers = await CustomersCollection.find().countAsync();
  
  console.log(
    `Init: 
    ${nCategories} categories, 
    ${nMenuItems} menu items, 
    ${nIngredients} ingredients,
    ${nSuppliers} suppliers,
    ${nScheduledChanges} scheduled changes.`
  );

  // Handle client-side routing for direct URL access
  WebApp.connectHandlers.use((req, res, next) => {
    const path = req.url.split("?")[0];

    // If the request is for a file (has an extension), let standard handlers process it
    if (path.includes(".")) {
      next();
      return;
    }

    // For routes that might be API endpoints, let them through to their handlers
    if (path.startsWith("/api/")) {
      next();
      return;
    }

    // For all other routes (our app pages), serve the main app HTML
    // This allows React Router to handle the route on the client
    const indexHtml = WebApp.clientPrograms["web.browser"].manifest.find(
      (file) => file.path === "index.html"
    );

    if (indexHtml) {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(indexHtml.content);
    } else {
      next();
    }
  });

  if (nOrders === 0) {
    console.log("No order items found. Initializing with default items.");
    const defaultItems = [
      {
        table:1,
        status:"closed",
        items:[{menu_item:"Espresso",quantity:2,price:4.2},{menu_item:"latte",quantity:1,price:4.2}],
        recievedPayment:15
      },
      {
        table:3,
        status:"closed",
        items:[{menu_item:"Espresso",quantity:1,price:4.2},{menu_item:"latte",quantity:1,price:4.2}],
        discount:2,
      }
    ];
    defaultItems.forEach(
      (item) => {
        Meteor.call("orders.insert",OrdersCollection.schema.clean(item));
      }
    );
  }

  if (nIngredients === 0) {
    console.log("No inventory items found. Initializing with default items.");
    const defaultItems = [
      {
        name: "Arabica beans",
        quantity: 2,
        units: "kg",
        price: "$1.50",
      },
      {
        name: "Robusta beans",
        quantity: 2,
        units: "kg",
        price: "$1.50",
      },
      {
        name: "Liberica beans",
        quantity: 2,
        units: "kg",
        price: "$1.50",
      },
    ];
    defaultItems.forEach(
      async (item) => await InventoryCollection.insertAsync(item)
    );
  }

  if (nSuppliers===0){
    console.log("No suppliers in database. some generated for funsies :D");
    const defaultSuppliers = [
      {
        name: "Coles",
        abn: "24 392 710 462",
        products: ["Beans", "Grinders", "Machines"],
        contact: "Jerry",
        email: "Jerry@gmail.com",
        phone: "0427382992",
        address: "5 bonk ave, 3190 melbourne vic",
        notes: ["Ships weekly", "Prefers email"],
      },
      {
        name: "Woolworth",
        abn: "24 392 710 462",
        products: ["Milk", "Cups"],
        contact: "Jerry",
        email: "Alice@gmail.com",
        phone: "0427382992",
        address: "5 bonk ave, 3190 melbourne vic",
        notes: ["Pays on time"],
      },
      {
        name: "Aldi",
        abn: "24 392 710 462",
        products: ["Coffee Machines"],
        contact: "Alex",
        email: "Alexy@gmail.com",
        phone: "0427382992",
        address: "5 bonk ave, 3190 melbourne vic",
        notes: ["High-volume orders"],
      },
    ]
    defaultSuppliers.forEach(
      async (item) => await SuppliersCollection.insertAsync(item)
    );
  }

  if (nTrainingModules === 0) {
    const seed = [
      { title: 'Food Safety Basics', description: 'Learn essential food safety practices.', duration: 30, link: 'https://example.com/food-safety' },
      { title: 'Customer Service', description: 'Best practices for customer interactions.', duration: 45, link: 'https://example.com/customer-service' },
      { title: 'POS System Training', description: 'How to use the Point of Sale system.', duration: 20, link: 'https://example.com/pos' },
      { title: 'Kitchen Operations', description: 'Overview of kitchen workflows.', duration: 40, link: 'https://example.com/kitchen-ops' },
      { title: 'Kitchen Cleaning', description: 'Best practices for kitchen cleaning techniques.', duration: 40, link: 'https://example.com/cleaning' },
    ];
    seed.forEach(
      async (doc) => await TrainingModules.insertAsync({ ...doc, createdAt: new Date() })
    );
  }

  if (nPromotions === 0) {
    PromotionsCollection.insertAsync({
      name: 'Promotion',
      code: 'TESTCODE',
      type: 'flat',
      amount: 1,
      scope: { type: 'all', value: null },
      requiresCode: false,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), 
      isActive: true,
      createdAt: new Date()
    });
    console.log('[Server] Inserted test promotion');
  }

  // Clear existing customers and initialize test customers for loyalty points testing
  // await CustomersCollection.removeAsync({});
  // console.log("[Server] Cleared existing customers database");
  
  if (nCustomers === 0) { // Always reinitialize customers for testing
    console.log("No customers found. Initializing with test customers for loyalty points testing.");
    const testCustomers = [
      {
        name: "Test Customer - 5% Discount",
        loyaltyPoints: 10,
        email: "test10@example.com",
        phone: "123456789"
      },
      {
        name: "Test Customer - 10% Discount", 
        loyaltyPoints: 20,
        email: "test20@example.com",
        phone: "123456788"
      },
      {
        name: "Test Customer - 15% Discount",
        loyaltyPoints: 30,
        email: "test30@example.com", 
        phone: "123456787"
      },
      {
        name: "Regular Customer",
        loyaltyPoints: 5,
        email: "regular@example.com",
        phone: "123456786"
      }
    ];
    
    testCustomers.forEach(async (customer) => {
      await CustomersCollection.insertAsync(customer);
    });
    
    console.log(`[Server] Inserted ${testCustomers.length} test customers with varying loyalty points`);
  }  
  // Add a scheduled item change to the first menu item.
  // if (nScheduledChanges === 0) {
  //   const firstMenuItem = await Menu.findOneAsync({}, { projection: { _id: 1, price: 1 } });

  //   await ScheduledChanges.insertAsync({
  //     targetCollection: 'menu',
  //     targetId: firstMenuItem._id,
  //     changes: {
  //       price: firstMenuItem.price + 1,
  //       available: false
  //     },
  //     scheduledTime: new Date(Date.now()),
  //     createdAt: new Date()
  //   });
  //   console.log('[Server] Inserted sample scheduled change');
  // }
});