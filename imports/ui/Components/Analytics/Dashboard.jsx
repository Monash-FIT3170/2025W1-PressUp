// ui/Components/Analytics/Dashboard.jsx
import React from 'react';
import './analytics.css';

import CategoryCountChart from './CategoryChart';
import IngredientUsageChart from './IngredientUsageChart';
import IngredientUsageTimeChart from './IngredientUsageTimeChart';
import ItemsFrequencyChart from './ItemsFrequencyChart';

export default function Dashboard() {
  return (
    <div className="analytics">
      <header className="analytics__header">
        <h1 className="analytics__title">Analytics</h1>
        <div className="analytics__controls">
          {/* Example accent to echo your POS feel */}
          <span className="badge">Live</span>
        </div>
      </header>

      <div className="analytics__grid">
        {/* Wide timeseries on top — tells the story at a glance */}
        <section className="card lg-span-12">
          <h2 className="card__title">Ingredient Usage Over Time</h2>
          <div className="chart-host">
            <IngredientUsageTimeChart onlyClosed={false} maxLines={8} />
          </div>
        </section>

        {/* Two-up overview cards */}
        <section className="card lg-span-6">
          <h2 className="card__title">Orders by Category</h2>
          <div className="chart-host">
            <CategoryCountChart onlyClosed={false} />
          </div>
        </section>

        <section className="card lg-span-6">
          <h2 className="card__title">Items Frequency (Occurrences)</h2>
          <div className="chart-host">
            <ItemsFrequencyChart onlyClosed={false} metric="occurrences" />
          </div>
        </section>

        {/* Full-width detail */}
        <section className="card lg-span-12">
          <h2 className="card__title">Ingredient Usage</h2>
          <div className="chart-host">
            <IngredientUsageChart onlyClosed={false} />
          </div>
        </section>
      </div>
    </div>
  );
}
