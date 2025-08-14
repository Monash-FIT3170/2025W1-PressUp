// server/main.js
import { Meteor } from "meteor/meteor";
import { WebApp } from "meteor/webapp";

import { MenuCategories } from '../imports/api/menu-categories/menu-categories-collection';
import '../imports/api/menu-categories/menu-categories-initialise';
import '../imports/api/menu-categories/menu-categories-publications';
import "../imports/api/menu-categories/menu-categories-methods";

import { Menu } from '../imports/api/menu/menu-collection';
import '../imports/api/menu/menu-initialise'
import '../imports/api/menu/menu-publications'
import '../imports/api/menu/menu-methods';

import { InventoryCollection } from "/imports/api/inventory/inventory-collection";
import "../imports/api/inventory/inventory-publications";
import "../imports/api/inventory/inventory-methods";

import { SuppliersCollection } from '../imports/api/suppliers/SuppliersCollection';
import "../imports/api/suppliers/SuppliersMethods";
import "../imports/api/suppliers/SuppliersPublications";

import { ScheduledChanges } from '../imports/api/scheduled-changes/scheduled-changes-collection';
import '../imports/api/scheduled-changes/scheduled-changes-methods';
import './scheduler.js';

Meteor.startup(async () => {
  // Testing menu and categories.
  const nCategories = await MenuCategories.find().countAsync();
  const nMenuItems = await Menu.find().countAsync();
  const nIngredients = await InventoryCollection.find().countAsync();
  const nSuppliers = await SuppliersCollection.find().countAsync();
  const nScheduledChanges = await ScheduledChanges.find().countAsync();

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

  // if (nScheduledChanges === 0) {
  //   console.log("No scheduled changes found. Initializing with default changes.");

  //   const defaultChanges = [
  //     {
  //       targetCollection: "menuItems",
  //       targetId: 1,
  //       changes: {
  //         price: 69,
  //         description: "Updated price for coffee",
  //       },
  //       scheduledTime: new Date(Date.now() + 1000 * 60 * 5)
  //     },
  //   ];

  //   defaultChanges.forEach(
  //     async (change) => await ScheduledChanges.insertAsync(change)
  //   );
  // }
});
