import React from 'react';
import { LoadingIndicator } from "../LoadingIndicator/LoadingIndicator.jsx";
import { useTracker, useSubscribe } from "meteor/react-meteor-data";
import { TableComponent } from './TableComponent.jsx';
import { TablesCollection } from '../../../api/tables/TablesCollection.js';

export default function TableMap() {

  const tables = useTracker(() => {
    const handle = Meteor.subscribe('tables.all');
    if (!handle.ready()) return [];
    return TablesCollection.find().fetch();
  }, []);
  

    const createNewTable = () => {
      const newTableNumber = tables.length + 1;
  
      Meteor.call('tables.insert', {
        table_number: newTableNumber,
        table_capacity: 4,
        table_width: 100,
        table_height: 100,
        table_xpos: 50,
        table_ypos: 50,
        table_rotation: 0,
        table_status: 'available',
      }, (error) => {
        if (error) {
          alert('Insert failed: ' + error.reason);
        }
      });
    };

    return (
      <div
        style={{
          position: 'relative',
          width: '80vw',
          height: '80vh',
          border: '1px solid #ccc',
          background: '#f9f9f9',
          overflow: 'hidden',
        }}
      >
        
        <button
          onClick={createNewTable}
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 1000,
            padding: '8px 12px',
            fontSize: '14px',
          }}
        >
        + Add Table
      </button>

        {tables.map((table) => (
          <TableComponent
            key={table._id}
            tableId={table._id}
            initialPosition={[table.table_xpos, table.table_ypos]}
            initialSize={[table.table_width, table.table_height]}
            initialRotation={table.table_rotation || 0}
            color={table.table_status === 'available' ? 'lightgreen' : 'lightcoral'}
            label={`Table ${table.table_number}`}
          />
        ))}
      </div>
    );
  }