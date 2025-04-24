import React from 'react';
import { Hello } from './Hello.jsx';
import { Info } from './Info.jsx';
import { Sidebar } from './Components/Sidebar.jsx';

export const App = () => (
  <div style={{ display: 'flex' }}>
    <Sidebar />
    <div style={{ marginLeft: '80px'}}>
      <h1>Inventory</h1>
      <Hello />
      <Info /> 
    </div>
  </div>
);
