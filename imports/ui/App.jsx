import React from 'react';
import { Hello } from './Hello.jsx';
import { Info } from './Info.jsx';
import { Sidebar } from './Components/Sidebar.jsx';

export const App = () => (
  <div className='app-container'>
    <Sidebar />
    <div className="main-content" style={{ marginLeft: '80px' }}>
      <h1>Inventory</h1>
      <Hello />
      <Info /> 
    </div>
  </div>
);
