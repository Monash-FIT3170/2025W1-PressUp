import React, { useState, useRef } from "react";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { TableComponent } from "./TableComponent.jsx";
import { TablesCollection } from "../../../api/tables/TablesCollection.js";
import "./TableMap.css"; // ← new import

export default function TableMap({ isAdmin }) {
  const [editMode, setEditMode] = useState(false);
  const mapRef = useRef(null);

  const tables = useTracker(() => {
    const handle = Meteor.subscribe("tables.all");
    if (!handle.ready()) return [];
    return TablesCollection.find().fetch();
  }, []);

  const toggleEditMode = () => setEditMode((m) => !m);

  const createNewTable = () => {
  // Find the first available number by checking existing table numbers
  const existingNumbers = tables.map(table => table.table_number);
  let newTableNumber = 1;
  while (existingNumbers.includes(newTableNumber)) {
    newTableNumber++;
  }

  Meteor.call(
    "tables.insert",
    {
      table_number: newTableNumber,
      table_capacity: 4,
      table_width: 100,
      table_height: 100,
      table_xpos: 50,
      table_ypos: 50,
      table_rotation: 0,
      table_status: "available",
    },
    (error) => {
      if (error) alert("Insert failed: " + error.reason);
    }
  );
};

  {
    /* Keeping track of current table status's. LETS GOO*/
  }
  const availableCount = tables.filter(
    (t) => t.table_status === "available"
  ).length;
  const checkedInCount = tables.filter(
    (t) => t.table_status === "checked-in"
  ).length;

  return (
    <div
      ref={mapRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        border: `${isAdmin && "1px solid #ccc"}`,
        background: `${isAdmin && "#f9f9f9"}`,
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {isAdmin && (
        <>
          {/* Edit‐mode toggle */}
          <button onClick={toggleEditMode} className="tablemap__edit-toggle">
            {editMode ? "Exit Edit Mode" : "Enter Edit Mode"}
          </button>

          {/* Add‐table (edit mode only) */}
          {editMode && (
            <button onClick={createNewTable} className="tablemap__add-table">
              + Add Table
            </button>
          )}
        </>
      )}

      {/* Status counter */}
      <div className="status-counter">
        <div className="status-counter__item status-counter__available">
          <div className="status-counter__dot" />
          <span>Available: {availableCount}</span>
        </div>
        <div className="status-counter__item status-counter__checked-in">
          <div className="status-counter__dot" />
          <span>Checked-in: {checkedInCount}</span>
        </div>
      </div>

      {/* Render each table */}
      {tables.map((table) => (
        <TableComponent
          key={table._id}
          tableNumber={table.table_number}
          initialPosition={[table.table_xpos, table.table_ypos]}
          initialSize={[table.table_width, table.table_height]}
          initialRotation={table.table_rotation || 0}
          editMode={editMode}
          containerRef = {mapRef}
        />
      ))}
    </div>
  );
}
