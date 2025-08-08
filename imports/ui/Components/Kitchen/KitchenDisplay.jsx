import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import KitchenOrderCard from './KitchenOrderCard.jsx';
import { OrdersCollection } from '/imports/api/orders/orders-collection';
import './KitchenDisplay.css';

export const KitchenDisplay = () => {
  const viewportRef = useRef(null);
  const probeGridRef = useRef(null);
  const probeCardRef = useRef(null);

  const [pageSize, setPageSize] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);

  const { orders, isLoading } = useTracker(() => {
    const sub = Meteor.subscribe('orders.active');
    const loading = !sub.ready();
    const data = OrdersCollection.find({}, { sort: { createdAt: 1 } }).fetch();
    return { orders: data, isLoading: loading };
  });

  // Compute how many cards fit on screen from a single probe card
  const computePageSize = () => {
    const viewport = viewportRef.current;
    const probeGrid = probeGridRef.current;
    const probeCard = probeCardRef.current;
    if (!viewport || !probeGrid || !probeCard) return;

    const vpRect = viewport.getBoundingClientRect();
    const style = window.getComputedStyle(probeGrid);

    // grid paddings (we subtract them from available height/width)
    const padX =
      parseFloat(style.paddingLeft || '0') + parseFloat(style.paddingRight || '0');
    const padY =
      parseFloat(style.paddingTop || '0') + parseFloat(style.paddingBottom || '0');

    // flex gap (single value used for both axes in our CSS)
    // fallback to 16 if gap can’t be parsed for any reason
    const gapRaw = style.gap || style.rowGap || '16px';
    const gap =
      (gapRaw.endsWith('px') ? parseFloat(gapRaw) : parseFloat(gapRaw)) || 16;

    // card size
    const cardRect = probeCard.getBoundingClientRect();
    const cardW = Math.ceil(cardRect.width);
    const cardH = Math.ceil(cardRect.height);

    if (cardW === 0 || cardH === 0) return; // layout not ready yet

    const availW = Math.max(0, Math.floor(vpRect.width - padX));
    const availH = Math.max(0, Math.floor(vpRect.height - padY));

    const cols = Math.max(1, Math.floor((availW + gap) / (cardW + gap)));
    const rows = Math.max(1, Math.floor((availH + gap) / (cardH + gap)));

    const size = Math.max(1, cols * rows);

    setPageIndex(0); // reset to first page when layout changes
    setPageSize(size);
  };

  // Recompute when orders change (structure) or on resize
  useEffect(() => {
    // Give DOM a tick to paint before measuring
    const id = requestAnimationFrame(() => setTimeout(computePageSize, 0));
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders.length]);

  useEffect(() => {
    const onResize = () => computePageSize();
    window.addEventListener('resize', onResize);

    let ro;
    if ('ResizeObserver' in window && viewportRef.current) {
      ro = new ResizeObserver(() => computePageSize());
      ro.observe(viewportRef.current);
    }
    return () => {
      window.removeEventListener('resize', onResize);
      if (ro) ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build pages from pageSize
  const pages = useMemo(() => {
    if (!pageSize || pageSize <= 0) return orders.length ? [orders] : [];
    const out = [];
    for (let i = 0; i < orders.length; i += pageSize) {
      out.push(orders.slice(i, i + pageSize));
    }
    return out;
  }, [orders, pageSize]);

  const maxPageIndex = Math.max(0, pages.length - 1);

  const remainingAfterThisPage = useMemo(() => {
    if (!pageSize) return Math.max(orders.length, 0);
    const shown = Math.min((pageIndex + 1) * pageSize, orders.length);
    return Math.max(orders.length - shown, 0);
  }, [orders.length, pageIndex, pageSize]);

  const goNext = () => setPageIndex((p) => Math.min(p + 1, maxPageIndex));
  const goPrev = () => setPageIndex((p) => Math.max(p - 1, 0));

  return (
    <div className="kitchen-page">
      <header className="kitchen-header">
        <h1>Kitchen — Open Orders</h1>
      </header>

      {isLoading ? (
        <div className="kitchen-empty">Loading orders…</div>
      ) : orders.length === 0 ? (
        <div className="kitchen-empty">No open orders.</div>
      ) : (
        <div className="kitchen-cards-flex-wrapper" ref={viewportRef}>
          {/* PROBE GRID: hidden, 1 card, used only for measuring */}
          <div
            ref={probeGridRef}
            className="kitchen-cards-flex"
            style={{
              position: 'absolute',
              visibility: 'hidden',
              pointerEvents: 'none',
              inset: 0,
            }}
          >
            {/* If we have at least one order, render exactly one card to measure */}
            {orders[0] && (
              <div ref={probeCardRef}>
                <KitchenOrderCard order={orders[0]} />
              </div>
            )}
          </div>

          {/* If pageSize not ready, just render first page worth by estimate (no slide yet) */}
          {!pageSize ? (
            <div className="kitchen-cards-flex">
              {orders.slice(0, 12).map((o) => (
                <KitchenOrderCard key={o._id} order={o} />
              ))}
            </div>
          ) : (
            <>
              {/* Sliding rail with fixed-width pages */}
              <div
                className="kitchen-rail"
                style={{ transform: `translateX(-${pageIndex * 100}%)` }}
              >
                {pages.map((page, i) => (
                  <div className="kitchen-page-slot" key={i}>
                    <div className="kitchen-cards-flex">
                      {page.map((order) => (
                        <KitchenOrderCard key={order._id} order={order} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pager */}
              <div className="kitchen-pager">
                <button onClick={goPrev} disabled={pageIndex === 0}>
                  ← Back
                </button>
                {remainingAfterThisPage > 0 && (
                  <button onClick={goNext}>+{remainingAfterThisPage} orders</button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default KitchenDisplay;
