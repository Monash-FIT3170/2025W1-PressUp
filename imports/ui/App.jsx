import React from 'react';
import { Sidebar } from './Components/Sidebar.jsx';
import { SupplierForm } from './SupplierForm.jsx';
import { SupplierManager } from './SupplierManager.jsx';

export const App = () => (
  <div className='app-container'>
    <Sidebar />
    
    <div className="main-content" style={{ marginLeft: '80px' }}>
       {/* Page title */}
      <h1>Inventory</h1>
      
       {/* Page content */}
      <SupplierForm/>
      <SupplierManager/>
    </div>
  </div>
);
