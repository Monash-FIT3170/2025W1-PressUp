// imports/ui/training/ModulePage.jsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { TrainingModules } from '/imports/api/trainingModules/trainingModuleCollection';
import { TrainingAssignments } from '/imports/api/TrainingAssignments/TrainingAssignmentsCollection';
import './ModulePage.css';

const ModulePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  // Keep hook order stable
  const safeId = typeof id === 'string' && id.length ? id : null;

  // Load the module
  const { loading, moduleDoc } = useTracker(() => {
    if (!safeId) return { loading: false, moduleDoc: null };
    const sub = Meteor.subscribe('trainingModules.one', safeId);
    return { loading: !sub.ready(), moduleDoc: TrainingModules.findOne(safeId) || null };
  }, [safeId]);

  const { mineReady, myAssignment } = useTracker(() => {
  const subMine = Meteor.subscribe('trainingAssignments.mine');
  const uid = Meteor.userId();
  const assignment = (subMine.ready() && safeId)
    ? TrainingAssignments.findOne({ moduleId: safeId })
    : null;

  return { mineReady: subMine.ready(), myAssignment: assignment || null };
}, [safeId]);

  useEffect(() => {
    document.title = moduleDoc?.title ? moduleDoc.title : 'Module';
  }, [moduleDoc]);

  const onCompleteModule = useCallback(async () => {
    if (busy || !safeId) return;
    try {
      setBusy(true);
      await Meteor.callAsync('trainingAssignments.markComplete', { moduleId: safeId }); // sets completedAt server-side
      alert('Module marked complete!');
      navigate('/training');
    } catch (err) {
      alert(err?.reason || err?.message || 'Failed to mark complete');
    } finally {
      setBusy(false);
    }
  }, [busy, safeId, navigate]);

  const isCompleted = !!myAssignment?.completedAt || myAssignment?.status === 'completed';
  const completedStamp = myAssignment?.completedAt
    ? new Intl.DateTimeFormat('en-AU', {
        timeZone: 'Australia/Melbourne',
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date(myAssignment.completedAt))
    : null;

  const completeBtn = useMemo(
    () =>
      !isCompleted ? (
        <button className="mark-complete-btn" onClick={onCompleteModule} disabled={busy || !safeId || !mineReady}>
          {busy ? 'Saving…' : 'Complete Module'}
        </button>
      ) : null,
    [busy, safeId, mineReady, isCompleted, onCompleteModule]
  );
  const backBtn = useMemo(
  () => (
    <button className="mark-back-btn" onClick={() => navigate('/training')}>
      Back
    </button>
  ),
  [navigate]
);

  // Build UI after all hooks
  let content;
  if (!safeId) {
    content = (
      <div style={{ padding: 20 }}>
        Invalid module link. <button onClick={() => navigate('/training')}>Back to Training</button>
      </div>
    );
  } else if (loading) {
    content = <div style={{ padding: 20 }}>Loading…</div>;
  } else if (!moduleDoc) {
    content = (
      <div style={{ padding: 20 }}>
        Module not found. <button onClick={() => navigate('/training')}>Back to Training</button>
      </div>
    );
  } else {
    content = (
      <>
        <header className="module-header">
          <h1>{moduleDoc.title}</h1>
        </header>

        <section className="module-content">
          <p>{moduleDoc.description}</p>
          {moduleDoc.link && (
            <p>
              Resource:&nbsp;
              <a href={moduleDoc.link} target="_blank" rel="noopener noreferrer">
                {moduleDoc.link}
              </a>
            </p>
          )}
          <p>Estimated duration: {moduleDoc.duration} min</p>

          {isCompleted && (
            <p style={{ marginTop: 12 }}>
              ✅ Completed{completedStamp ? ` on ${completedStamp}` : ''}.
            </p>
          )}
        </section>
        
        <div className="button-container">
          <div className="btn-row">
            {backBtn}
            {completeBtn}
          </div>
        </div>
      </>
    );
  }

  return <div className="module-page">{content}</div>;
};

export default ModulePage;
