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
  containerRef,
}) {
  const ref = useRef(null);
  const [frame, setFrame] = useState({
    translate: initialPosition,
    width: initialSize[0],
    height: initialSize[1],
    rotate: initialRotation,
  });

    // Helpers: rotation-aware bounds
  const toRad = (deg) => (deg * Math.PI) / 180;

  // Given w,h,deg and container cw,ch, shrink w/h if needed so the rotated AABB fits.
  const fitSizeForRotation = (w, h, deg, cw, ch) => {
    const c = Math.abs(Math.cos(toRad(deg)));
    const s = Math.abs(Math.sin(toRad(deg)));

    // Width constraint: w*c + h*s <= cw  → h <= (cw - w*c)/s  and  w <= (cw - h*s)/c
    // Height constraint: w*s + h*c <= ch → h <= (ch - w*s)/c  and  w <= (ch - h*c)/s
    let maxW = w, maxH = h;

    if (c > 0) maxW = Math.min(maxW, (cw - h * s) / c);
    if (s > 0) maxW = Math.min(maxW, (ch - h * c) / s);
    if (s > 0) maxH = Math.min(maxH, (cw - w * c) / s);
    if (c > 0) maxH = Math.min(maxH, (ch - w * s) / c);

    // Guard against negative/NaN and over-shrink
    maxW = Math.max(10, isFinite(maxW) ? maxW : w);
    maxH = Math.max(10, isFinite(maxH) ? maxH : h);

    // If current w/h exceed what fits, clamp them
    const newW = Math.min(w, maxW);
    const newH = Math.min(h, maxH);
    return [newW, newH];
  };

  // Clamp translate so the **rotated** rect stays inside
  const clampTranslateWithRotation = (x, y, w, h, deg, containerEl) => {
    const el = containerEl;
    if (!el) return [x, y, w, h];
    const cw = el.clientWidth;
    const ch = el.clientHeight;

    // First, ensure size itself can fit once rotated
    [w, h] = fitSizeForRotation(w, h, deg, cw, ch);

    // Work with center: center must stay within [hw, cw-hw] × [hh, ch-hh]
    const c = Math.abs(Math.cos(toRad(deg)));
    const s = Math.abs(Math.sin(toRad(deg)));
    const halfW = (w * c + h * s) / 2; // rotated half-extent in X
    const halfH = (w * s + h * c) / 2; // rotated half-extent in Y

    let cx = x + w / 2;
    let cy = y + h / 2;

    cx = Math.min(Math.max(halfW, cx), cw - halfW);
    cy = Math.min(Math.max(halfH, cy), ch - halfH);

    // Convert back to top-left translate used by our transform
    x = cx - w / 2;
    y = cy - h / 2;

    return [x, y, w, h];
  };

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
          rootContainer={containerRef?.current || undefined}
          bounds={containerRef?.current || undefined}
          onDragStart={({ set }) => {
            setIsTransforming(true);
            set(frameRef.current.translate);
          }}
          onDrag={({ beforeTranslate }) => {
            let [x, y] = beforeTranslate;
            let { width: w, height: h, rotate: deg } = frameRef.current;
            [x, y, w, h] = clampTranslateWithRotation(x, y, w, h, deg, containerRef?.current);
            frameRef.current.width = w;
            frameRef.current.height = h;
            frameRef.current.translate = [x, y];
            ref.current.style.width = `${w}px`;
            ref.current.style.height = `${h}px`;
            ref.current.style.transform = `translate(${x}px, ${y}px) rotate(${deg}deg)`;
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
            let [x, y] = drag.beforeTranslate;
            const deg = frameRef.current.rotate;
            [x, y, width, height] = clampTranslateWithRotation(x, y, width, height, deg, containerRef?.current);
            frameRef.current.width = width;
            frameRef.current.height = height;
            frameRef.current.translate = [x, y];
            ref.current.style.width = `${width}px`;
            ref.current.style.height = `${height}px`;
            ref.current.style.transform = `translate(${x}px, ${y}px) rotate(${deg}deg)`;
          }}
          onResizeEnd={({ lastEvent }) => {
            let { width, height, drag } = lastEvent;
            let [x, y] = drag.beforeTranslate;
            const deg = frameRef.current.rotate;
            [x, y, width, height] = clampTranslateWithRotation(x, y, width, height, deg, containerRef?.current);
            const updated = { ...frameRef.current, width, height, translate: [x, y] };
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
            let [x, y] = frameRef.current.translate;
            let { width: w, height: h } = frameRef.current;
            [x, y, w, h] = clampTranslateWithRotation(x, y, w, h, beforeRotate, containerRef?.current);
            frameRef.current.width = w;
            frameRef.current.height = h;
            frameRef.current.translate = [x, y];
            ref.current.style.width = `${w}px`;
            ref.current.style.height = `${h}px`;
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
