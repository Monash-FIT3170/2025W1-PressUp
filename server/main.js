// server/main.js
import { Meteor } from 'meteor/meteor';
import {InventoryCollection} from '/imports/api/inventory/inventory-collection';
import "../imports/api/inventory/inventory-publications";
import "../imports/api/inventory/inventory-methods";
import { WebApp } from 'meteor/webapp';

Meteor.startup(() => {
  // Handle client-side routing for direct URL access
  WebApp.connectHandlers.use((req, res, next) => {
    const path = req.url.split('?')[0];
    
    // If the request is for a file (has an extension), let standard handlers process it
    if (path.includes('.')) {
      next();
      return;
    }
    
    // For routes that might be API endpoints, let them through to their handlers
    if (path.startsWith('/api/')) {
      next();
      return;
    }
    
    // For all other routes (our app pages), serve the main app HTML
    // This allows React Router to handle the route on the client
    const indexHtml = WebApp.clientPrograms['web.browser'].manifest.find(file => file.path === 'index.html');
    
    if (indexHtml) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(indexHtml.content);
    } else {
      next();
    }
  });
});
