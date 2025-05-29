import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { TableComponent } from './TableComponent.jsx';
import { TablesCollection } from '../../../api/tables/TablesCollection.js';

export default function TableMap() {
  const [editMode, setEditMode] = useState(false);

  const tables = useTracker(() => {
    const handle = Meteor.subscribe('tables.all');
    if (!handle.ready()) return [];
    return TablesCollection.find().fetch();
  }, []);

  const toggleEditMode = () => setEditMode((m) => !m);

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
      {/* Toggle Edit Mode always visible */}
      <button
        onClick={toggleEditMode}
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 1000,
          padding: '8px 12px',
          fontSize: '14px',
        }}
      >
        {editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
      </button>

      {/* Only show Add Table button in edit mode */}
      {editMode && (
        <button
          onClick={createNewTable}
          style={{
            position: 'absolute',
            top: 10,
            left: 140,
            zIndex: 1000,
            padding: '8px 12px',
            fontSize: '14px',
          }}
        >
          + Add Table
        </button>
      )}

      {tables.map((table) => (
        <TableComponent
          key={table._id}
          tableId={table._id}
          initialPosition={[table.table_xpos, table.table_ypos]}
          initialSize={[table.table_width, table.table_height]}
          initialRotation={table.table_rotation || 0}
          editMode={editMode}
          color={table.table_status === 'available' ? 'lightgreen' : 'lightcoral'}
          label={`Table ${table.table_number}`}
        />
      ))}
    </div>
  );
}