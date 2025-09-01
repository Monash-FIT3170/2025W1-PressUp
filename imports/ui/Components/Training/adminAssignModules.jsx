// imports/ui/training/AdminAssignModules.jsx
import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { TrainingModules } from '/imports/api/trainingModules/trainingModuleCollection';

const AdminAssignModules = () => {
  const { isAdmin, users, modules, loading } = useTracker(() => {
    const subMe = Meteor.subscribe('currentUser');
    const subUsers = Meteor.subscribe('allUsers');
    const subModules = Meteor.subscribe('trainingModules.all');

    const meDoc = Meteor.user();
    const amIAdmin = !!meDoc?.isAdmin;

    return {
      isAdmin: amIAdmin,
      users: amIAdmin ? Meteor.users.find({}, { sort: { username: 1 } }).fetch() : [],
      modules: TrainingModules.find({}, { sort: { createdAt: -1 } }).fetch(),
      loading: !(subMe.ready() && subUsers.ready() && subModules.ready()),
    };
  });

  const [selectedUser, setSelectedUser] = React.useState('');
  const [selectedModule, setSelectedModule] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (!isAdmin) return <div style={{ padding: 16 }}>Admins only.</div>;

  const assign = async () => {
    if (!selectedUser || !selectedModule || busy) return;
    try {
      setBusy(true);
      await Meteor.callAsync('trainingAssignments.assign', {
        userId: selectedUser,
        moduleId: selectedModule,
      });
      alert('Module assigned!');
    } catch (err) {
      alert(err?.reason || err?.message || 'Failed to assign module');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Assign Training Module</h2>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)} disabled={busy}>
          <option value="">Select user…</option>
          {users.map(u => (
            <option key={u._id} value={u._id}>
              {u.username} {u.isAdmin ? '(admin)' : ''}
            </option>
          ))}
        </select>

        <select value={selectedModule} onChange={e => setSelectedModule(e.target.value)} disabled={busy}>
          <option value="">Select module…</option>
          {modules.map(m => (
            <option key={m._id} value={m._id}>
              {m.title} ({m.duration}m)
            </option>
          ))}
        </select>

        <button onClick={assign} disabled={busy}>
          {busy ? 'Assigning…' : 'Assign'}
        </button>
      </div>
    </div>
  );
};

export default AdminAssignModules;
