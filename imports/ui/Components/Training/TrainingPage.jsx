// imports/ui/training/TrainingPage.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import TrainingCard from './TrainingCard.jsx';
import AdminAssignModules from './adminAssignModules.jsx';
import { TrainingModules } from '/imports/api/trainingModules/trainingModuleCollection';
import { TrainingAssignments } from '/imports/api/TrainingAssignments/TrainingAssignmentsCollection';
import './TrainingPage.css';

const TrainingPage = ({ sidebarOpen }) => {
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

  if (loading) return <div className="training-empty">Loading training modules…</div>;

  const notCompletedCards = assigned
    .map(a => ({ assignment: a, module: modulesById[a.moduleId] }))
    .filter(x => x.module);

  const completedCards = completed
    .map(a => ({ assignment: a, module: modulesById[a.moduleId] }))
    .filter(x => x.module);

  return (
    <div className="training-page">
      <header className="training-header">
        <h1>Staff Training Modules</h1>
      </header>

      {isAdmin && (
        <div className="training-admin-wrap">
          <AdminAssignModules />
          <hr />
        </div>
      )}

      {/* Strict 2-column layout: left = not completed, right = completed */}
      <div className="training-columns">
        <div className="training-col">
          <h2>Modules not completed</h2>
          <div className="training-col-list">
            {notCompletedCards.length === 0 ? (
              <div className="training-empty">All caught up — no pending modules!</div>
            ) : (
              notCompletedCards.map(({ module }) => (
                <TrainingCard key={module._id} module={module} />
              ))
            )}
          </div>
        </div>

        <div className="training-col">
          <h2>Modules completed</h2>
          <div className="training-col-list">
            {completedCards.length === 0 ? (
              <div className="training-empty">No completed modules yet.</div>
            ) : (
              completedCards.map(({ module }) => (
                <TrainingCard key={module._id} module={module} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

TrainingPage.propTypes = { sidebarOpen: PropTypes.bool };
export default TrainingPage;
