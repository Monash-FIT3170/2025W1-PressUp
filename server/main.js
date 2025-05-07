// server/main.js
import { Meteor } from "meteor/meteor";
import { WebApp } from "meteor/webapp";

import { MenuCategories } from "/imports/api/menu-categories/menu-categories-collection";
import { Menu } from "/imports/api/menu/menu-collection";
import "/imports/api/menu/menu-methods";

import { InventoryCollection } from "/imports/api/inventory/inventory-collection";
import "../imports/api/inventory/inventory-publications";
import "../imports/api/inventory/inventory-methods";
import { SuppliersCollection } from '../imports/api/suppliers/SuppliersCollection';
import "../imports/api/suppliers/SuppliersMethods";
import "../imports/api/suppliers/SuppliersPublications";

Meteor.startup(async () => {
  // Testing menu and categories.
  const nCategories = await MenuCategories.find().countAsync();
  const nMenuItems = await Menu.find().countAsync();
  const nIngredients = await InventoryCollection.find().countAsync();
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
});
