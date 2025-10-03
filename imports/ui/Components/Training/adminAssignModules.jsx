// imports/ui/training/AdminAssignModules.jsx
import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { TrainingModules } from '/imports/api/trainingModules/trainingModuleCollection';
import { EmployeesCollection } from '/imports/api/payroll/employee/employees-collection';

const AdminAssignModules = () => {
  const { isAdmin, employees, modules, loading } = useTracker(() => {
    const subMe = Meteor.subscribe('currentUser');
    const subModules = Meteor.subscribe('trainingModules.all');
    const subEmployees = Meteor.subscribe('employees.all');

    const meDoc = Meteor.user();
    const amIAdmin = !!meDoc?.isAdmin;

    return {
      isAdmin: amIAdmin,
      employees: amIAdmin ? EmployeesCollection.find({}, { sort: { last_name: 1, first_name: 1 } }).fetch() : [],
      modules: TrainingModules.find({}, { sort: { createdAt: -1 } }).fetch(),
      loading: !(subMe.ready() && subModules.ready() && subEmployees.ready()),
    };
  });

  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState('');
  const [selectedModule, setSelectedModule] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (!isAdmin) return <div style={{ padding: 16 }}>Admins only.</div>;

  const assign = async () => {
    const employeeId = Number(selectedEmployeeId);
    if (!employeeId || !selectedModule || busy) return;
    try {
      setBusy(true);
      await Meteor.callAsync('trainingAssignments.assign', {
        employeeId,                 // <- CHANGED
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
        <select
          value={selectedEmployeeId}
          onChange={e => setSelectedEmployeeId(e.target.value)}
          disabled={busy}
        >
          <option value="">Select employee…</option>
          {employees.map(emp => (
            <option key={emp._id} value={emp.employee_id}>
              {emp.last_name}, {emp.first_name} 
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
