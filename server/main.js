// server/main.js
import { Meteor } from "meteor/meteor";
import { WebApp } from "meteor/webapp";

import { MenuCategories } from "/imports/api/menu-categories/menu-categories-collection";
import { Menu } from "/imports/api/menu/menu-collection";
import '/imports/api/menu-categories/menu-categories-initialise';
import '/imports/api/menu-categories/menu-categories-publications';
import '/imports/api/menu-categories/menu-categories-methods';
import "/imports/api/menu/menu-methods";

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
import { initializeUsers } from '../imports/api/users/users-initialization';

import { PromotionsCollection } from '/imports/api/promotions/promotions-collection.js';
import '/imports/api/promotions/promotions-methods.js';
import '/imports/api/promotions/promotions-publications.js';
import { TablesCollection } from '../imports/api/tables/TablesCollection';
import "../imports/api/tables/TablesMethods";
import "../imports/api/tables/TablesPublications";

import { EmployeesCollection } from '../imports/api/payroll/employee/employees-collection.js';
import "../imports/api/payroll/employee/employees-methods.js";
import "../imports/api/payroll/employee/employees-publications.js";

import { CustomersCollection } from '../imports/api/customers/customers-collection.js';
import "../imports/api/customers/customers-publications.js";
import "../imports/api/customers/customers-methods.js";
Meteor.startup(async () => {
  // Testing menu and categories.
  const nCategories = await MenuCategories.find().countAsync();
  const nMenuItems = await Menu.find().countAsync();
  const nIngredients = await InventoryCollection.find().countAsync();
  const nSuppliers = await SuppliersCollection.find().countAsync();
  const nOrders = await OrdersCollection.find().countAsync();
  await initializeUsers();
  const nPromotions = await PromotionsCollection.find().countAsync();
  
  console.log(
    `Init: ${nCategories} categories, ${nMenuItems} menu items, ${nIngredients} ingredients.`
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
});
