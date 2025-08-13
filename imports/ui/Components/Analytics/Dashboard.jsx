// ui/Components/Analytics/Dashboard.jsx
import React from 'react';
import CategoryCountChart from './CategoryChart';
import IngredientUsageChart from './IngredientUsageChart';
import IngredientUsageTimeChart from './IngredientUsageTimeChart'; // ← NEW
import ItemsFrequencyChart from './ItemsFrequencyChart';          // ← ADDED

export default function Dashboard() {
  return (
    <div style={{ padding: 16 }}>
      <h1>Analytics</h1>

      <div
        style={{
          display: 'grid',
          gap: 24,
          gridTemplateColumns: '1fr',
        }}
      >
        {/* Existing: Orders by Category (bar) */}
        <section style={{ height: 380 }}>
          <h2 style={{ marginBottom: 8 }}>Orders by Category</h2>
          <CategoryCountChart onlyClosed={false} />
        </section>

        {/* Existing: Ingredient Usage (bar) */}
        <section style={{ height: 380 }}>
          <h2 style={{ marginBottom: 8 }}>Ingredient Usage</h2>
          <IngredientUsageChart onlyClosed={false} />
        </section>

        {/* NEW: Ingredient Usage Over Time (multi-line) */}
        <section style={{ height: 380 }}>
          <h2 style={{ marginBottom: 8 }}>Ingredient Usage Over Time</h2>
          {/* Optionally pass start/end dates, e.g.:
              <IngredientUsageTimeseries start={new Date('2025-08-01')} end={new Date()} />
          */}
          <IngredientUsageTimeChart onlyClosed={false} maxLines={8} />
        </section>

        {/* NEW: Items Frequency (Occurrences) */}
        <section style={{ height: 380 }}>
          <h2 style={{ marginBottom: 8 }}>Items Frequency (Occurrences)</h2>
          <ItemsFrequencyChart onlyClosed={false} metric="occurrences" />
        </section>
      </div>
    </div>
  );
}
