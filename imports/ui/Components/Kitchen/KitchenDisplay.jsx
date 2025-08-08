import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import KitchenOrderCard from './KitchenOrderCard.jsx';
import { OrdersCollection } from '/imports/api/orders/orders-collection';
import './KitchenDisplay.css';

/**
 * Props:
 * - sidebarOpen?: boolean  (optional; nice-to-have)
 */
export const KitchenDisplay = ({ sidebarOpen }) => {
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

  // ---- layout measurement (pure) -------------------------------------------
  const computePageSize = () => {
    const viewport = viewportRef.current;
    const probeGrid = probeGridRef.current;
    const probeCard = probeCardRef.current;
    if (!viewport || !probeGrid || !probeCard) return;

    const vpRect = viewport.getBoundingClientRect();
    const style = window.getComputedStyle(probeGrid);

    // paddings
    const padX =
      (parseFloat(style.paddingLeft || '0') +
        parseFloat(style.paddingRight || '0')) || 0;
    const padY =
      (parseFloat(style.paddingTop || '0') +
        parseFloat(style.paddingBottom || '0')) || 0;

    // gap
    const gapRaw = style.gap || style.rowGap || '16px';
    const gap =
      (gapRaw.endsWith('px') ? parseFloat(gapRaw) : parseFloat(gapRaw)) || 16;

    // card size (measure a real card)
    const cardRect = probeCard.getBoundingClientRect();
    const cardW = Math.ceil(cardRect.width);
    const cardH = Math.ceil(cardRect.height);
    if (cardW === 0 || cardH === 0) return;

    const availW = Math.max(0, Math.floor(vpRect.width - padX));
    const availH = Math.max(0, Math.floor(vpRect.height - padY));

    const cols = Math.max(1, Math.floor((availW + gap) / (cardW + gap)));
    const rows = Math.max(1, Math.floor((availH + gap) / (cardH + gap)));
    const size = Math.max(1, cols * rows);

    // IMPORTANT: do not touch pageIndex here
    setPageSize(size);
  };

  // when orders count changes, re-measure after paint
  useEffect(() => {
    const id = requestAnimationFrame(() => setTimeout(computePageSize, 0));
    return () => cancelAnimationFrame(id);
  }, [orders.length]);

  // window resize + ResizeObserver on viewport
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
  }, []);

  // recompute on sidebar prop changes (if the parent passes it)
  useEffect(() => {
    if (typeof sidebarOpen === 'undefined') return;
    computePageSize();
    const t = setTimeout(computePageSize, 0);
    return () => clearTimeout(t); // fixed cleanup
  }, [sidebarOpen]);

  // ALSO listen for custom events + transition end (works even without the prop)
  useEffect(() => {
    const onPing = () => computePageSize();

    const onTransitionEnd = (e) => {
      const p = e.propertyName || '';
      if (
        p.includes('width') ||
        p.includes('left') ||
        p.includes('right') ||
        p.includes('transform') ||
        p.includes('padding') ||
        p.includes('margin')
      ) {
        computePageSize();
      }
    };

    window.addEventListener('layout:sidebar-toggled', onPing);
    document.addEventListener('transitionend', onTransitionEnd, true);

    return () => {
      window.removeEventListener('layout:sidebar-toggled', onPing);
      document.removeEventListener('transitionend', onTransitionEnd, true);
    };
  }, []);

  // Clamp pageIndex ONLY when it becomes out of range
  useEffect(() => {
    if (!pageSize) return;
    const pagesNow = Math.max(1, Math.ceil(orders.length / pageSize));
    setPageIndex((prev) => (prev > pagesNow - 1 ? pagesNow - 1 : prev));
  }, [pageSize, orders.length]);

  // ---- paging ---------------------------------------------------------------
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

  // ---- render ---------------------------------------------------------------
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
          {/* HIDDEN PROBE: used only for sizing a single card in a real grid context */}
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
            {orders[0] && (
              <div ref={probeCardRef}>
                <KitchenOrderCard order={orders[0]} />
              </div>
            )}
          </div>

          {!pageSize ? (
            <div className="kitchen-cards-flex">
              {orders.slice(0, 12).map((o) => (
                <KitchenOrderCard key={o._id} order={o} />
              ))}
            </div>
          ) : (
            <>
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

              <div className="kitchen-pager">
                <button onClick={goPrev} disabled={pageIndex === 0}>← Back</button>
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
