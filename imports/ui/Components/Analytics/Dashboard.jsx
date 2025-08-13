// ui/Components/Analytics/Dashboard.jsx
import React from 'react';
import CategoryCountChart from './CategoryChart';
import IngredientUsageChart from './IngredientUsageChart';

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
        <section style={{ height: 380 }}>
          <h2 style={{ marginBottom: 8 }}>Orders by Category</h2>
          <CategoryCountChart onlyClosed={false} />
        </section>

        <section style={{ height: 380 }}>
          <h2 style={{ marginBottom: 8 }}>Ingredient Usage</h2>
          <IngredientUsageChart onlyClosed={false} />
        </section>
      </div>
    </div>
  );
}
