import React from 'react';
import './KitchenOrderCard.css';

function formatAEST(date) {
  try {
    return new Intl.DateTimeFormat('en-AU', {
      timeZone: 'Australia/Melbourne',
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  } catch (_) {
    return date.toLocaleString('en-AU', { timeZone: 'Australia/Melbourne' });
  }
}

const KitchenOrderCard = ({ order }) => {
  const { table, items = [], createdAt } = order;

  return (
    <div className="kitchen-order-card">
      <div className="koc-head">
        <h3 className="koc-title">Table {table}</h3>
        <span className="koc-time">{formatAEST(new Date(createdAt))}</span>
      </div>

      <ul className="koc-items">
        {items.map((it, idx) => (
          <li key={it.id || idx} className="koc-item">
            <span className="koc-qty">{it.quantity}&times;</span>
            <span className="koc-name">{it.menu_item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default KitchenOrderCard;
