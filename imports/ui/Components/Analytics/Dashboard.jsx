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
import PeakHourChart from './PeakHourAnalysisChart';

// Finance page rendered inside this file
import TaxPanel from './TaxPanel';

const BRAND = '#FCD581';

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
    { key: 'ALL',   label: 'All time',     start: null,                                      end: null },
    { key: 'TODAY', label: 'Today',        start: dayjs().startOf('day'),                    end: dayjs().endOf('day') },
    { key: '7D',    label: 'Last 7 days',  start: dayjs().subtract(7,  'day').startOf('day'), end: dayjs() },
    { key: '30D',   label: 'Last 30 days', start: dayjs().subtract(30, 'day').startOf('day'), end: dayjs() },
    { key: 'YTD',   label: 'YTD',          start: dayjs().startOf('year'),                    end: dayjs() },
  ]), []);

  const isActive = (p) =>
    (range.start ? dayjs(range.start).isSame(p.start, 'day') : !p.start) &&
    (range.end ? dayjs(range.end).isSame(p.end, 'day') : !p.end);

  const setDate = (field, val) => {
    onChange({
      ...range,
      [field]: val
        ? (field === 'end'
            ? dayjs(val).endOf('day').toDate()
            : dayjs(val).startOf('day').toDate())
        : null
    });
  };

  return (
    <div style={{
      display: 'flex', gap: 8, alignItems: 'center',
      marginBottom: 16, flexWrap: 'wrap'
    }}>
      {presets.map(p => (
        <button
          key={p.key}
          onClick={() => onChange({ start: p.start?.toDate?.() ?? null, end: p.end?.toDate?.() ?? null })}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: isActive(p) ? '2px solid #3b82f6' : '1px solid #ddd',
            background: '#fff', cursor: 'pointer'
          }}
        >{p.label}</button>
      ))}

      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginLeft: 8 }}>
        <label style={{ fontSize: 12, color: '#374151' }}>From</label>
        <input
          type="date"
          value={range.start ? dayjs(range.start).format('YYYY-MM-DD') : ''}
          onChange={e => setDate('start', e.target.value || null)}
          style={{ padding: 6, borderRadius: 6, border: '1px solid #ddd', background: '#fff' }}
        />
        <label style={{ fontSize: 12, color: '#374151' }}>To</label>
        <input
          type="date"
          value={range.end ? dayjs(range.end).format('YYYY-MM-DD') : ''}
          onChange={e => setDate('end', e.target.value || null)}
          style={{ padding: 6, borderRadius: 6, border: '1px solid #ddd', background: '#fff' }}
        />
        <button
          onClick={() => onChange({ start: null, end: null })}
          style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}
        >
          Clear
        </button>
        <label style={{ fontSize: 12, color: '#374151' }}>Metric</label>
        <select
          value={range.metric || 'sales'}
          onChange={(e) => onChange({ ...range, metric: e.target.value })}
          style={{ padding: 6, borderRadius: 6, border: '1px solid #ddd', background: '#fff', fontSize: 14 }}
        >
          <option value="sales">Sales</option>
          <option value="cost">Cost</option>
          <option value="profit">Profit</option>
        </select>
      </div>
    </div>
  );
}

// --- KPIs loader --------------------------------------------------------------
function useKpis(filter) {
  const [kpis, setKpis] = useState({ orders: 0, value: 0, avgOrderValue: 0, activeItems: 0, metric: 'sales' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Meteor.call('analytics.kpis', filter, (err, res) => {
      if (!cancelled) {
        setKpis(err ? { orders: 0, value: 0, avgOrderValue: 0, activeItems: 0, metric: filter.metric } : (res || {}));
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [filter?.start?.valueOf?.(), filter?.end?.valueOf?.(), filter?.metric]);

  return { kpis, loading };
}

// --- New Tab Bar (outside the grey box, styled like reference) ---------------
function TabBar({ active, onChange }) {
  const tabs = [
    { key: 'analytics', label: 'Analytics' },
    { key: 'finance',   label: 'Finance' },
  ];
  return (
    <div className="tabs-shell">
      <div className="tabs">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`tab-btn ${active === t.key ? 'active' : ''}`}
            onClick={() => onChange(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  // Which tab is visible
  const [activeTab, setActiveTab] = useState('analytics');

  // Filters for analytics
  const [range, setRange] = useState({ start: null, end: null, metric: 'sales' });

  const filter = useMemo(() => ({
    onlyClosed: false,
    start: range.start ? new Date(range.start) : null,
    end: range.end ? new Date(range.end) : null,
    metric: range.metric
  }), [range]);

  const { kpis } = useKpis(filter);

  return (
    <div style={{ padding: 24, width: '100%', minHeight: '100%' }}>
      {/* Tabs OUTSIDE the grey box */}
      <TabBar active={activeTab} onChange={setActiveTab} />

      {/* Grey dashboard surface */}
      <div style={{ background: '#ababacff', borderRadius: 12, padding: 24 }}>
        {/* --- FINANCE TAB --------------------------------------------------- */}
        {activeTab === 'finance' && (
          <div style={{ background: '#ffffff', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,.06), 0 10px 20px rgba(0,0,0,.03)' }}>
            <TaxPanel startFromYear={2025} />
          </div>
        )}

        {/* --- ANALYTICS TAB ------------------------------------------------- */}
        {activeTab === 'analytics' && (
          <>
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
              {/* Top KPI row */}
              <div style={{ gridColumn: 'span 3' }}>
                <StatsCard
                  title="Orders"
                  value={kpis.orders?.toLocaleString?.() ?? '0'}
                  subvalue={range.start || range.end ? 'Filtered' : 'All-time'}
                />
              </div>
              <div style={{ gridColumn: 'span 3' }}>
                <StatsCard
                  title={range.metric === 'cost' ? 'Cost'
                    : range.metric === 'profit' ? 'Profit'
                      : 'Revenue'}
                  value={`$${(kpis.value ?? 0).toLocaleString()}`}
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
                <SalesOverTimeChart
                  onlyClosed={false}
                  start={filter.start}
                  end={filter.end}
                  metric={filter.metric}
                />
              </section>

              <section style={{ ...cardStyle, gridColumn: 'span 6' }}>
                <SalesByProductTable onlyClosed={false} start={filter.start} end={filter.end} />
              </section>

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

              <section style={{ ...cardStyle, gridColumn: 'span 12' }}>
                <h3 style={{ margin: 0, marginBottom: 8, fontSize: 14, color: '#374151' }}>Peak Hour Analysis</h3>
                <div style={{ height: 340 }}>
                  <PeakHourChart onlyClosed={false} start={filter.start} end={filter.end} />
                </div>
              </section>
            </div>
          </>
        )}
      </div>

      {/* Styles for the tabs + responsive grid tweaks */}
      <style>{`
        * { box-sizing: border-box; }
        @media (max-width: 1280px) { .grid { grid-template-columns: repeat(8, minmax(0,1fr)); } }
        @media (max-width: 900px)  { .grid { grid-template-columns: repeat(4, minmax(0,1fr)); } }
        @media (max-width: 640px)  { .grid { grid-template-columns: repeat(1, minmax(0,1fr)); } }

        .tabs-shell {
          width: 100%;
          display: flex;
          justify-content: flex-start;
          margin-bottom: 16px;
        }
        .tabs {
          display: inline-flex;
          background: ${BRAND};
          border-radius: 14px;
          padding: 4px;
          gap: 0;
          box-shadow: 0 6px 18px rgba(0,0,0,0.06);
        }
        .tab-btn {
          border: none;
          background: transparent;
          padding: 10px 18px;
          font-weight: 700;
          border-radius: 10px;
          cursor: pointer;
          transition: transform .1s ease, background .15s ease, box-shadow .15s ease;
          color: #333;
        }
        .tab-btn:hover {
          background: rgba(255,255,255,0.35);
          transform: translateY(-1px);
        }
        .tab-btn.active {
          background: #fff;
          color: #000;
          box-shadow: 0 2px 8px rgba(0,0,0,0.10);
        }
      `}</style>
    </div>
  );
}
