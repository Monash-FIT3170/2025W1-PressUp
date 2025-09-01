// imports/ui/training/TrainingPage.jsx
import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import TrainingCard from './TrainingCard.jsx';
import AdminAssignModules from './adminAssignModules.jsx';
import { TrainingModules } from '/imports/api/trainingModules/trainingModuleCollection';
import { TrainingAssignments } from '/imports/api/TrainingAssignments/TrainingAssignmentsCollection';
import './TrainingPage.css';

const TrainingPage = ({ sidebarOpen }) => {
  const viewportRef = useRef(null);
  const probeGridRef = useRef(null);
  const probeCardRef = useRef(null);

  const [pageSize, setPageSize] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);

  const { loading, assigned, completed, modulesById, isAdmin } = useTracker(() => {
    const subMe = Meteor.subscribe('currentUser');
    const subMods = Meteor.subscribe('trainingModules.all');
    const subMine = Meteor.subscribe('trainingAssignments.mine');

    const me = Meteor.user();
    const amIAdmin = !!me?.isAdmin;

    const assignments = TrainingAssignments.find({}, { sort: { assignedAt: -1 } }).fetch();
    const modules = TrainingModules.find().fetch();
    const modulesByIdMap = Object.fromEntries(modules.map(m => [m._id, m]));

    const notDone = assignments.filter(a => a.status === 'assigned');
    const done = assignments.filter(a => a.status === 'completed');

    return {
      loading: !(subMe.ready() && subMods.ready() && subMine.ready()),
      assigned: notDone,
      completed: done,
      modulesById: modulesByIdMap,
      isAdmin: amIAdmin,
    };
  });

  // ---- layout math (unchanged) ----
  const computePageSize = useCallback(() => {
    const viewport = viewportRef.current;
    const probeGrid = probeGridRef.current;
    const probeCard = probeCardRef.current;
    if (!viewport || !probeGrid || !probeCard) return;

    const vpRect = viewport.getBoundingClientRect();
    const style = window.getComputedStyle(probeGrid);

    const padX = parseFloat(style.paddingLeft || '0') + parseFloat(style.paddingRight || '0');
    const padY = parseFloat(style.paddingTop || '0') + parseFloat(style.paddingBottom || '0');
    const gap = parseFloat(style.gap || style.rowGap || '16px');

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

  useEffect(() => { requestAnimationFrame(computePageSize); }, [computePageSize]);
  useEffect(() => {
    const onResize = () => computePageSize();
    window.addEventListener('resize', onResize);

    let ro;
    if ('ResizeObserver' in window && viewportRef.current) {
      ro = new ResizeObserver(computePageSize);
      ro.observe(viewportRef.current);
    }
    return () => {
      window.removeEventListener('resize', onResize);
      if (ro) ro.disconnect();
    };
  }, [computePageSize]);

  useEffect(() => {
    if (typeof sidebarOpen === 'undefined') return;
    computePageSize();
    const t = setTimeout(computePageSize, 0);
    return () => clearTimeout(t);
  }, [sidebarOpen, computePageSize]);

  // Build card models from assignments + module docs
  const notCompletedCards = useMemo(
    () => assigned.map(a => ({ assignment: a, module: modulesById[a.moduleId] })).filter(x => x.module),
    [assigned, modulesById]
  );
  const completedCards = useMemo(
    () => completed.map(a => ({ assignment: a, module: modulesById[a.moduleId] })).filter(x => x.module),
    [completed, modulesById]
  );

  // Paged rail for "Not completed"
  useEffect(() => {
    if (!pageSize) return;
    const totalPages = Math.max(1, Math.ceil(notCompletedCards.length / pageSize));
    setPageIndex(prev => Math.min(prev, totalPages - 1));
  }, [pageSize, notCompletedCards.length]);

  const pages = useMemo(() => {
    if (!pageSize || pageSize <= 0) return notCompletedCards.length ? [notCompletedCards] : [];
    const out = [];
    for (let i = 0; i < notCompletedCards.length; i += pageSize) {
      out.push(notCompletedCards.slice(i, i + pageSize));
    }
    return out;
  }, [notCompletedCards, pageSize]);

  if (loading) return <div className="training-empty">Loading training modules…</div>;

  return (
    <div className="training-page">
      <header className="training-header">
        <h1>Staff Training Modules</h1>
      </header>

      {/* Admin panel lives right on the same page */}
      {isAdmin && (
        <div style={{ padding: '0 16px 16px' }}>
          <AdminAssignModules />
          <hr style={{ marginTop: 16 }} />
        </div>
      )}

      <div style={{ padding: '0 16px' }}>
        <h2>Modules not completed</h2>
      </div>

      <div className="training-cards-flex-wrapper" ref={viewportRef}>
        {/* Hidden probe grid for measuring card size */}
        <div
          ref={probeGridRef}
          className="training-cards-flex"
          style={{ position: 'absolute', visibility: 'hidden', pointerEvents: 'none', inset: 0 }}
        >
          {notCompletedCards[0] && (
            <div ref={probeCardRef}>
              <TrainingCard module={{ ...notCompletedCards[0].module }} />
            </div>
          )}
        </div>

        {/* Render pages for NOT COMPLETED */}
        <div className="training-rail" style={{ transform: `translateX(-${pageIndex * 100}%)` }}>
          {pages.map((page, i) => (
            <div className="training-page-slot" key={i}>
              <div className="training-cards-flex">
                {page.map(({ module }) => (
                  <TrainingCard key={module._id} module={module} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        <h2>Modules completed</h2>
        {completedCards.length === 0 ? (
          <div className="training-empty">No completed modules yet.</div>
        ) : (
          <div className="training-cards-flex">
            {completedCards.map(({ module }) => (
              <TrainingCard key={module._id} module={module} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

TrainingPage.propTypes = { sidebarOpen: PropTypes.bool };
export default TrainingPage;
