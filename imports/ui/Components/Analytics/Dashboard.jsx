// ui/Components/Analytics/Dashboard.jsx
import React, { useMemo, useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Meteor } from 'meteor/meteor';

import CategoryCountChart from './CategoryChart';
import IngredientUsageChart from './IngredientUsageChart';
import IngredientUsageTimeChart from './IngredientUsageTimeChart';
import ItemsFrequencyChart from './ItemsFrequencyChart';
import StatsCard from './StatsCard';
import SalesByProductTable from './SalesByProductTable';
import SalesOverTimeChart from './SalesOverTimeChart';

const cardStyle = {
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 1px 3px rgba(0,0,0,.06), 0 10px 20px rgba(0,0,0,.03)',
  padding: 16,
  display: 'flex',
  flexDirection: 'column',
  minHeight: 180
};

// --- Small inline filter bar (presets + custom) ------------------------------
function FilterBar({ range, onChange }) {
  const presets = useMemo(() => ([
    { key: 'ALL',  label: 'All time',    start: null,                                     end: null },
    { key: '7D',   label: 'Last 7 days', start: dayjs().subtract(7, 'day').startOf('day'), end: dayjs() },
    { key: '30D',  label: 'Last 30 days',start: dayjs().subtract(30,'day').startOf('day'), end: dayjs() },
    { key: 'YTD',  label: 'YTD',         start: dayjs().startOf('year'),                   end: dayjs() },
  ]), []);

  const isActive = (p) =>
    (range.start ? dayjs(range.start).isSame(p.start, 'day') : !p.start) &&
    (range.end   ? dayjs(range.end).isSame(p.end, 'day')     : !p.end);

  const setDate = (field, val) => {
    onChange({
      ...range,
      [field]: val ? dayjs(val).startOf(field === 'end' ? 'day' : 'day').toDate() : null
    });
  };

  const [metric, setMetric] = useState('cost'); // 'sales' | 'cost' | 'profit'

  // Build the filter object we pass to all calls/components
  const filter = useMemo(() => ({
    onlyClosed: false,
    start: range.start ? new Date(range.start) : null,
    end: range.end ? new Date(range.end) : null,
    metric, // <---- NEW
  }), [range, metric]);

  return (
    <div style={{
      display:'flex', gap:8, alignItems:'center',
      marginBottom:16, flexWrap:'wrap'
    }}>
      {presets.map(p => (
        <button
          key={p.key}
          onClick={() => onChange({ start: p.start?.toDate?.() ?? null, end: p.end?.toDate?.() ?? null })}
          style={{
            padding:'8px 12px',
            borderRadius:8,
            border: isActive(p) ? '2px solid #3b82f6' : '1px solid #ddd',
            background:'#fff', cursor:'pointer'
          }}
        >{p.label}</button>
      ))}

      <div style={{ display:'flex', gap:6, alignItems:'center', marginLeft:8 }}>
        <label style={{ fontSize:12, color:'#374151' }}>From</label>
        <input
          type="date"
          value={range.start ? dayjs(range.start).format('YYYY-MM-DD') : ''}
          onChange={e => setDate('start', e.target.value || null)}
          style={{ padding:6, borderRadius:6, border:'1px solid #ddd', background:'#fff' }}
        />
        <label style={{ fontSize:12, color:'#374151' }}>To</label>
        <input
          type="date"
          value={range.end ? dayjs(range.end).format('YYYY-MM-DD') : ''}
          onChange={e => setDate('end', e.target.value || null)}
          style={{ padding:6, borderRadius:6, border:'1px solid #ddd', background:'#fff' }}
        />
        <button
          onClick={() => onChange({ start: null, end: null })}
          style={{ padding:'8px 10px', borderRadius:8, border:'1px solid #ddd', background:'#fff', cursor:'pointer' }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}

// --- KPIs loader --------------------------------------------------------------
function useKpis(filter) {
  const [kpis, setKpis] = useState({ orders: 0, revenue: 0, avgOrderValue: 0, activeItems: 0, metric: 'sales' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Meteor.call('analytics.kpis', filter, (err, res) => {
      if (!cancelled) {
        setKpis(err ? { orders: 0, revenue: 0, avgOrderValue: 0, activeItems: 0, metric: filter.metric } : (res || {}));
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [filter?.start?.valueOf?.(), filter?.end?.valueOf?.()]); // re-run when dates change

  return { kpis, loading };
}

export default function Dashboard() {
  // Single source of truth for time filter:
  const [range, setRange] = useState({ start: null, end: null });

  // Build the filter object we pass to all calls/components
  const filter = useMemo(() => ({
    onlyClosed: false,
    start: range.start ? new Date(range.start) : null,
    end:   range.end   ? new Date(range.end)   : null
  }), [range]);

  const { kpis } = useKpis(filter);

  return (
    <div style={{ background: '#929395ff', padding: 24, width: '100%', minHeight: '100vh' }}>
      <h1 style={{ margin: 0, marginBottom: 12, fontSize: 24 }}>Analytics</h1>

      {/* Filters */}
      <FilterBar range={range} onChange={setRange} />

      {/* 12-column responsive grid */}
      <div
        className="grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
          gap: 20,
        }}
      >
        {/* Top KPI row (now dynamic) */}
        <div style={{ gridColumn: 'span 3' }}>
          <StatsCard
            title={kpis.metric === 'cost' ? 'Cost'
              : kpis.metric === 'profit' ? 'Profit'
                : 'Revenue'}
            value={`$${(kpis.value ?? 0).toLocaleString()}`}
            subvalue={range.start || range.end ? '' : 'YTD'}
          />
        </div>
        <div style={{ gridColumn: 'span 3' }}>
          <StatsCard
            title="Revenue"
            value={`$${(kpis.revenue ?? 0).toLocaleString()}`}
            subvalue={range.start || range.end ? '' : 'YTD'}
          />
        </div>
        <div style={{ gridColumn: 'span 3' }}>
          <StatsCard
            title="Avg. Order Value"
            value={`$${(kpis.avgOrderValue ?? 0).toFixed(2)}`}
            subvalue={range.start || range.end ? '' : 'Last 30 days'}
          />
        </div>
        <div style={{ gridColumn: 'span 3' }}>
          <StatsCard title="Active Items" value={kpis.activeItems ?? 0} />
        </div>
        
        <section style={{ ...cardStyle, gridColumn: 'span 6' }}>
          <SalesOverTimeChart onlyClosed={false} start={filter.start} end={filter.end} />
        </section>

        <section style={{ ...cardStyle, gridColumn: 'span 6' }}>
          <SalesByProductTable onlyClosed={false} start={filter.start} end={filter.end} />
        </section>

        {/* Big charts (all receive same filter) */}
        <section style={{ ...cardStyle, gridColumn: 'span 7' }}>
          <h3 style={{ margin: 0, marginBottom: 8, fontSize: 14, color: '#374151' }}>Orders by Category</h3>
          <div style={{ height: 340 }}>
            <CategoryCountChart onlyClosed={false} start={filter.start} end={filter.end} />
          </div>
        </section>

        <section style={{ ...cardStyle, gridColumn: 'span 5' }}>
          <h3 style={{ margin: 0, marginBottom: 8, fontSize: 14, color: '#374151' }}>Ingredient Usage</h3>
          <div style={{ height: 340 }}>
            <IngredientUsageChart onlyClosed={false} start={filter.start} end={filter.end} />
          </div>
        </section>

        <section style={{ ...cardStyle, gridColumn: 'span 6' }}>
          <h3 style={{ margin: 0, marginBottom: 8, fontSize: 14, color: '#374151' }}>Ingredient Usage Over Time</h3>
          <div style={{ height: 340 }}>
            <IngredientUsageTimeChart onlyClosed={false} start={filter.start} end={filter.end} maxLines={8} />
          </div>
        </section>

        <section style={{ ...cardStyle, gridColumn: 'span 6' }}>
          <h3 style={{ margin: 0, marginBottom: 8, fontSize: 14, color: '#374151' }}>Items Frequency (Occurrences)</h3>
          <div style={{ height: 340 }}>
            <ItemsFrequencyChart onlyClosed={false} start={filter.start} end={filter.end} metric="occurrences" />
          </div>
        </section>
      </div>

      {/* Simple responsiveness (shrink columns on small screens) */}
      <style>{`
  * { box-sizing: border-box; }
  @media (max-width: 1280px) { .grid { grid-template-columns: repeat(8, minmax(0,1fr)); } }
  @media (max-width: 900px)  { .grid { grid-template-columns: repeat(4, minmax(0,1fr)); } }
  @media (max-width: 640px)  { .grid { grid-template-columns: repeat(1, minmax(0,1fr)); } }
`}</style>
    </div>
  );
}
