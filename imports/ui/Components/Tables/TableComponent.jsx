import React, { useRef, useState } from 'react';
import Moveable from 'react-moveable';
import { TablesCollection } from '../../../api/tables/TablesCollection';

export function TableComponent({
    initialPosition = [0, 0],
    initialSize = [50, 50],
    initialRotation = 0,
    color = 'dodgerblue',
    tableId,
  }) {
    const ref = useRef(null); // ✅ one ref per component
  
    const [frame, setFrame] = useState({
      translate: initialPosition,
      width: initialSize[0],
      height: initialSize[1],
      rotate: initialRotation,
    });

    const saveFrameToDb = (frame) => {
      Meteor.call('tables.updateLayout', tableId, frame.translate[0], frame.translate[1], frame.width, frame.height, frame.rotate, (err) => {
        if (err) {
          alert('Failed to update table position: ' + err.reason);
        }
      });
    };

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={ref}
        style={{
          position: 'absolute',
          width: `${frame.width}px`,
          height: `${frame.height}px`,
          background: 'dodgerblue',
          transform: `
            translate(${frame.translate[0]}px, ${frame.translate[1]}px)
            rotate(${frame.rotate}deg)
          `,
          touchAction: 'none',
        }}
      />

<Moveable
        target={ref}
        draggable
        resizable
        rotatable

        onDragStart={({ set }) => set(frame.translate)}
        onDrag={({ beforeTranslate }) => {
          setFrame((prev) => ({ ...prev, translate: beforeTranslate }));
        }}
        onDragEnd={() => saveFrameToDb(frame)}

        onResizeStart={({ setOrigin, dragStart }) => {
          setOrigin(['%', '%']);
          dragStart?.set(frame.translate);
        }}
        onResize={({ width, height, drag }) => {
          const beforeTranslate = drag.beforeTranslate;
          setFrame((prev) => ({
            ...prev,
            width,
            height,
            translate: beforeTranslate,
          }));
        }}
        onResizeEnd={() => saveFrameToDb(frame)}

        onRotateStart={({ set }) => set(frame.rotate)}
        onRotate={({ beforeRotate }) => {
          setFrame((prev) => ({ ...prev, rotate: beforeRotate }));
        }}
        onRotateEnd={() => saveFrameToDb(frame)}
      />
    </div>
  );
}
