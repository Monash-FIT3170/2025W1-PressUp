// TableComponent.jsx
import React, { useRef, useState } from 'react';
import Moveable from 'react-moveable';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { TablesCollection } from "../../../api/tables/TablesCollection.js";
import './TableComponent.css';
import { TableActionPopup } from './TableActionPopup.jsx';

export function TableComponent({
  tableId,
  initialPosition = [0, 0],
  initialSize     = [50, 50],
  initialRotation =   0,
  editMode        = false,
}) {
  const ref = useRef(null);
  const [frame, setFrame] = useState({
    translate: initialPosition,
    width:     initialSize[0],
    height:    initialSize[1],
    rotate:    initialRotation,
  });

  const [showPopup, setShowPopup] = useState(false);

  // reactively fetch the table doc
  const table = useTracker(
    () => TablesCollection.findOne(tableId) || {},
    [tableId]
  );

  const saveFrameToDb = (updatedFrame) => {
    Meteor.call(
      'tables.updateLayout',
      tableId,
      updatedFrame.translate[0],
      updatedFrame.translate[1],
      updatedFrame.width,
      updatedFrame.height,
      updatedFrame.rotate,
      (err) => {
        if (err) alert('Failed to update table layout: ' + err.reason);
      }
    );
  };

  const deleteTable = () => {
    Meteor.call('tables.remove', tableId, (err) => {
      if (err) alert('Failed to delete table: ' + err.reason);
    });
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Main table box */}
      <div
        ref={ref}
        className={
          `table${table.table_status === 'available' ? ' available' : ''}`
        }
        style={{
          width:  `${frame.width}px`,
          height: `${frame.height}px`,
          transform: `translate(${frame.translate[0]}px, ${frame.translate[1]}px)
                      rotate(${frame.rotate}deg)`,
          touchAction: 'none',
        }}
        onClick={() => !editMode && setShowPopup(true)}
      >
        {(() => {
          // Determine orientation & how many seats to draw
          const isHorizontal = frame.width >= frame.height;
          const longest      = isHorizontal ? frame.width : frame.height;
          const seatCount    = Math.max(1, Math.floor(longest / 100));
          const seatLength   = 60; // match .seat width

          return Array.from({ length: seatCount }).flatMap((_, i) => {
            const centerPos      = ((i + 1) / (seatCount + 1)) * longest;
            const adjustedOffset = centerPos - seatLength / 2;
            const style = isHorizontal
              ? { left: `${adjustedOffset}px` }
              : { top:  `${adjustedOffset}px` };

            return [
              <div
                key={`seat-${i}-1`}
                className={`seat ${
                  isHorizontal ? 'seat--top' : 'seat--left'
                }`}
                style={style}
              />,
              <div
                key={`seat-${i}-2`}
                className={`seat ${
                  isHorizontal ? 'seat--bottom' : 'seat--right'
                }`}
                style={style}
              />
            ];
          });
        })()}

        {/* Only when not editing, show the table number & status */}
        {!editMode && table.table_number != null && (
          <div className="table-label">
            <div className="table-number">T{table.table_number}</div>
            <div className="table-status">{table.table_status}</div>
          </div>
        )}
      </div>

      {!editMode && showPopup && (
        <TableActionPopup
          tableId = {tableId} 
          onClose={()=>setShowPopup(false)}
        />
      )}

      {/* Delete button (edit mode) */}
      {editMode && (
        <button
          onClick={deleteTable}
          className="delete-table-button"
          style={{
            top:  `${frame.translate[1] + frame.height  / 2}px`,
            left: `${frame.translate[0] + frame.width   / 2}px`,
          }}
        >
          Delete&nbsp;&nbsp;Table
        </button>
      )}

      {/* Moveable controls (edit mode) */}
      {editMode && (
        <Moveable
          target={ref}
          draggable
          resizable
          rotatable
          renderRotator={() => null}
          onDragStart={({ set }) => set(frame.translate)}
          onDrag={({ beforeTranslate }) =>
            setFrame(prev => ({ ...prev, translate: beforeTranslate }))
          }
          onDragEnd={() => saveFrameToDb(frame)}
          onResizeStart={({ setOrigin, dragStart }) => {
            setOrigin(['%', '%']);
            dragStart?.set(frame.translate);
          }}
          onResize={({ width, height, drag }) => {
            setFrame(prev => ({
              ...prev,
              width,
              height,
              translate: drag.beforeTranslate,
            }));
          }}
          onResizeEnd={() => saveFrameToDb(frame)}
          onRotateStart={({ set }) => set(frame.rotate)}
          onRotate={({ beforeRotate }) =>
            setFrame(prev => ({ ...prev, rotate: beforeRotate }))
          }
          onRotateEnd={() => saveFrameToDb(frame)}
        />
      )}
    </div>
  );
}
