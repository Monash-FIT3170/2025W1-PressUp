import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { TablesCollection } from "../../../api/tables/TablesCollection.js";
import "./TableComponent.css";
import { TableActionPopup } from "./TableActionPopup.jsx";

export function TableComponent({
  tableNumber,
  initialPosition = [0, 0],
  initialSize = [50, 50],
  initialRotation = 0,
  editMode = false,
}) {
  const ref = useRef(null);
  const [frame, setFrame] = useState({
    translate: initialPosition,
    width: initialSize[0],
    height: initialSize[1],
    rotate: initialRotation,
  });

  // Track live frame values without rerendering
  const frameRef = useRef(frame);
  useEffect(() => {
    frameRef.current = frame;
  }, [frame]);

  const [showPopup, setShowPopup] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);

  // Reactive table data
  const table = useTracker(
    () => TablesCollection.findOne({ table_number: tableNumber }) || {},
    [tableNumber]
  );

  const saveFrameToDb = (updatedFrame) => {
    Meteor.call(
      "tables.updateLayout",
      tableNumber,
      updatedFrame.translate[0],
      updatedFrame.translate[1],
      updatedFrame.width,
      updatedFrame.height,
      updatedFrame.rotate,
      (err) => {
        if (err) alert("Failed to update table layout: " + err.reason);
      }
    );
  };

  const deleteTable = () => {
    Meteor.call("tables.remove", tableNumber, (err) => {
      if (err) alert("Failed to delete table: " + err.reason);
    });
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Main table box */}
      <div
        ref={ref}
        className={`table${
          table.table_status === "available" ? " available" : ""
        }`}
        style={{
          width: `${frame.width}px`,
          height: `${frame.height}px`,
          transform: `translate(${frame.translate[0]}px, ${frame.translate[1]}px) rotate(${frame.rotate}deg)`,
          touchAction: "none",
        }}
        onClick={() => !editMode && setShowPopup(true)}
      >
        {/* Seats top & bottom */}
        {Array.from({ length: Math.max(1, Math.floor(frame.width / 100)) }).map(
          (_, i) => {
            const seatLength = 60;
            const centerPos =
              ((i + 1) / (Math.max(1, Math.floor(frame.width / 100)) + 1)) *
              frame.width;
            const offset = centerPos - seatLength / 2;
            return (
              <React.Fragment key={i}>
                <div
                  className="seat seat--top"
                  style={{ left: `${offset}px` }}
                />
                <div
                  className="seat seat--bottom"
                  style={{ left: `${offset}px` }}
                />
              </React.Fragment>
            );
          }
        )}

        {/* Label if not editing */}
        {!editMode && table.table_number != null && (
          <div className="table-label">
            <div className="table-number">T{table.table_number}</div>
            <div className="table-status">{table.table_status}</div>
          </div>
        )}
      </div>

      {/* Popup in view mode */}
      {!editMode && showPopup && (
        <TableActionPopup
          tableNumber={tableNumber}
          onClose={() => setShowPopup(false)}
        />
      )}

      {/* Delete button in edit mode (hidden during transform) */}
      {editMode && !isTransforming && (
        <button
          onClick={deleteTable}
          className="delete-table-button"
          style={{
            top: `${frame.translate[1] + frame.height / 2}px`,
            left: `${frame.translate[0] + frame.width / 2}px`,
          }}
        >
          Delete&nbsp;&nbsp;Table
        </button>
      )}

      {/* Moveable controls */}
      {editMode && (
        <Moveable
          target={ref}
          draggable
          resizable
          rotatable
          onDragStart={({ set }) => {
            setIsTransforming(true);
            set(frameRef.current.translate);
          }}
          onDrag={({ beforeTranslate }) => {
            frameRef.current.translate = beforeTranslate;
            const [x, y] = beforeTranslate;
            ref.current.style.transform = `translate(${x}px, ${y}px) rotate(${frameRef.current.rotate}deg)`;
          }}
          onDragEnd={() => {
            const updated = { ...frameRef.current };
            setFrame(updated);
            saveFrameToDb(updated);
            setIsTransforming(false);
          }}
          onResizeStart={({ setOrigin, dragStart }) => {
            setIsTransforming(true);
            setOrigin(["%", "%"]);
            dragStart.set(frameRef.current.translate);
          }}
          onResize={({ width, height, drag }) => {
            frameRef.current.width = width;
            frameRef.current.height = height;
            frameRef.current.translate = drag.beforeTranslate;
            const [x, y] = drag.beforeTranslate;
            ref.current.style.width = `${width}px`;
            ref.current.style.height = `${height}px`;
            ref.current.style.transform = `translate(${x}px, ${y}px) rotate(${frameRef.current.rotate}deg)`;
          }}
          onResizeEnd={({ lastEvent }) => {
            const { width, height, drag } = lastEvent;
            const [x, y] = drag.beforeTranslate;
            const updated = {
              ...frameRef.current,
              width,
              height,
              translate: [x, y],
            };
            setFrame(updated);
            saveFrameToDb(updated);
            setIsTransforming(false);
          }}
          onRotateStart={({ set }) => {
            setIsTransforming(true);
            set(frameRef.current.rotate);
          }}
          onRotate={({ beforeRotate }) => {
            frameRef.current.rotate = beforeRotate;
            const [x, y] = frameRef.current.translate;
            ref.current.style.transform = `translate(${x}px, ${y}px) rotate(${beforeRotate}deg)`;
          }}
          onRotateEnd={({ lastEvent }) => {
            const { beforeRotate } = lastEvent;
            const updated = { ...frameRef.current, rotate: beforeRotate };
            setFrame(updated);
            saveFrameToDb(updated);
            setIsTransforming(false);
          }}
        />
      )}
    </div>
  );
}
