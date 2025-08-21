// ui/Components/Analytics/Dashboard.jsx
import React from 'react';
import CategoryCountChart from './CategoryChart';
import IngredientUsageChart from './IngredientUsageChart';
import IngredientUsageTimeChart from './IngredientUsageTimeChart';
import ItemsFrequencyChart from './ItemsFrequencyChart';
import StatsCard from './StatsCard';

const cardStyle = {
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 1px 3px rgba(0,0,0,.06), 0 10px 20px rgba(0,0,0,.03)',
  padding: 16,
  display: 'flex',
  flexDirection: 'column',
  minHeight: 180
};

export default function Dashboard() {
  return (
    <div style={{ background: '#929395ff', padding: 24, width: '100%', minHeight: '100vh' }}>
      <h1 style={{ margin: 0, marginBottom: 16, fontSize: 24 }}>Analytics</h1>

      {/* 12-column responsive grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
          gap: 20,
        }}
      >
        {/* Top KPI row */}
        <div style={{ gridColumn: 'span 3' }}>
          <StatsCard title="Orders (All-time)" value="2,318" subvalue="vs last month +4%" />
        </div>
        <div style={{ gridColumn: 'span 3' }}>
          <StatsCard title="Revenue" value="$2.0M" subvalue="YTD" />
        </div>
        <div style={{ gridColumn: 'span 3' }}>
          <StatsCard title="Avg. Order Value" value="$28.40" subvalue="Last 30 days" />
        </div>
        <div style={{ gridColumn: 'span 3' }}>
          <StatsCard title="Active Items" value="487" />
        </div>

        {/* Big charts */}
        <section style={{ ...cardStyle, gridColumn: 'span 7' }}>
          <h3 style={{ margin: 0, marginBottom: 8, fontSize: 14, color: '#374151' }}>Orders by Category</h3>
          <div style={{ height: 340 }}>
            <CategoryCountChart onlyClosed={false} />
          </div>
        </section>

        <section style={{ ...cardStyle, gridColumn: 'span 5' }}>
          <h3 style={{ margin: 0, marginBottom: 8, fontSize: 14, color: '#374151' }}>Ingredient Usage</h3>
          <div style={{ height: 340 }}>
            <IngredientUsageChart onlyClosed={false} />
          </div>
        </section>

        <section style={{ ...cardStyle, gridColumn: 'span 6' }}>
          <h3 style={{ margin: 0, marginBottom: 8, fontSize: 14, color: '#374151' }}>Ingredient Usage Over Time</h3>
          <div style={{ height: 340 }}>
            <IngredientUsageTimeChart onlyClosed={false} maxLines={8} />
          </div>
        </section>

        <section style={{ ...cardStyle, gridColumn: 'span 6' }}>
          <h3 style={{ margin: 0, marginBottom: 8, fontSize: 14, color: '#374151' }}>Items Frequency (Occurrences)</h3>
          <div style={{ height: 340 }}>
            <ItemsFrequencyChart onlyClosed={false} metric="occurrences" />
          </div>
        </section>

        {/* Full-width “optional” row if you want one large viz */}
        {/* <section style={{ ...cardStyle, gridColumn: '1 / -1' }}>
          <h3 style={{ margin: 0, marginBottom: 8 }}>Anything Full-Width</h3>
          <div style={{ height: 360 }} />
        </section> */}
      </div>

      {/* Simple responsiveness (shrink columns on small screens) */}
      <style>{`
  * {
    box-sizing: border-box;
  }

  @media (max-width: 1280px) {
    .grid { grid-template-columns: repeat(8, minmax(0,1fr)); }
  }
  @media (max-width: 900px) {
    .grid { grid-template-columns: repeat(4, minmax(0,1fr)); }
  }
  @media (max-width: 640px) {
    .grid { grid-template-columns: repeat(1, minmax(0,1fr)); }
  }
`}</style>

    </div>
  );
}
