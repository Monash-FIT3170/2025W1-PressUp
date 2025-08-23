import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import TrainingCard from "./TrainingCard.jsx";
import "./TrainingPage.css";

// Sample training data
const trainingModules = [
  { id: "1", title: "Food Safety Basics", description: "Learn essential food safety practices.", duration: "30 min", createdAt: new Date() },
  { id: "2", title: "Customer Service", description: "Best practices for customer interactions.", duration: "45 min", createdAt: new Date() },
  { id: "3", title: "POS System Training", description: "How to use the Point of Sale system.", duration: "20 min", createdAt: new Date() },
  { id: "4", title: "Kitchen Operations", description: "Overview of kitchen workflows.", duration: "40 min", createdAt: new Date() },
];

const TrainingPage = ({ sidebarOpen }) => {
  const viewportRef = useRef(null);
  const probeGridRef = useRef(null);
  const probeCardRef = useRef(null);

  const [pageSize, setPageSize] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const modules = trainingModules;
  const isLoading = false;

  // Calculate how many cards fit in the viewport
  const computePageSize = useCallback(() => {
    const viewport = viewportRef.current;
    const probeGrid = probeGridRef.current;
    const probeCard = probeCardRef.current;
    if (!viewport || !probeGrid || !probeCard) return;

    const vpRect = viewport.getBoundingClientRect();
    const style = window.getComputedStyle(probeGrid);

    const padX = parseFloat(style.paddingLeft || "0") + parseFloat(style.paddingRight || "0");
    const padY = parseFloat(style.paddingTop || "0") + parseFloat(style.paddingBottom || "0");
    const gap = parseFloat(style.gap || style.rowGap || "16px");

    const cardRect = probeCard.getBoundingClientRect();
    const cardW = Math.ceil(cardRect.width);
    const cardH = Math.ceil(cardRect.height);
    if (cardW === 0 || cardH === 0) return;

    const availW = Math.max(0, vpRect.width - padX);
    const availH = Math.max(0, vpRect.height - padY);

    const cols = Math.max(1, Math.floor((availW + gap) / (cardW + gap)));
    const rows = Math.max(1, Math.floor((availH + gap) / (cardH + gap)));

    setPageSize(Math.max(1, cols * rows));
  }, []);

  // Run on mount, modules length change, resize, and sidebar toggle
  useEffect(() => { requestAnimationFrame(computePageSize); }, [modules.length, computePageSize]);
  useEffect(() => {
    const onResize = () => computePageSize();
    window.addEventListener("resize", onResize);

    let ro;
    if ("ResizeObserver" in window && viewportRef.current) {
      ro = new ResizeObserver(computePageSize);
      ro.observe(viewportRef.current);
    }

    return () => {
      window.removeEventListener("resize", onResize);
      if (ro) ro.disconnect();
    };
  }, [computePageSize]);

  useEffect(() => {
    if (typeof sidebarOpen === "undefined") return;
    computePageSize();
    const t = setTimeout(computePageSize, 0);
    return () => clearTimeout(t);
  }, [sidebarOpen, computePageSize]);

  // Adjust page index if size changes
  useEffect(() => {
    if (!pageSize) return;
    const totalPages = Math.max(1, Math.ceil(modules.length / pageSize));
    setPageIndex((prev) => Math.min(prev, totalPages - 1));
  }, [pageSize, modules.length]);

  // Build pages
  const pages = useMemo(() => {
    if (!pageSize || pageSize <= 0) return modules.length ? [modules] : [];
    const out = [];
    for (let i = 0; i < modules.length; i += pageSize) {
      out.push(modules.slice(i, i + pageSize));
    }
    return out;
  }, [modules, pageSize]);

  return (
    <div className="training-page">
      <header className="training-header">
        <h1>Staff Training Modules</h1>
      </header>

      {isLoading ? (
        <div className="training-empty">Loading training modules…</div>
      ) : modules.length === 0 ? (
        <div className="training-empty">No training modules available.</div>
      ) : (
        <div className="training-cards-flex-wrapper" ref={viewportRef}>
          {/* Hidden probe grid for measuring card size */}
          <div ref={probeGridRef} className="training-cards-flex" style={{ position: "absolute", visibility: "hidden", pointerEvents: "none", inset: 0 }}>
            {modules[0] && <div ref={probeCardRef}><TrainingCard module={modules[0]} /></div>}
          </div>

          {/* Render actual pages */}
          <div className="training-rail" style={{ transform: `translateX(-${pageIndex * 100}%)` }}>
            {pages.map((page, i) => (
              <div className="training-page-slot" key={i}>
                <div className="training-cards-flex">
                  {page.map((module) => <TrainingCard key={module.id} module={module} />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

TrainingPage.propTypes = { sidebarOpen: PropTypes.bool };

export default TrainingPage;
