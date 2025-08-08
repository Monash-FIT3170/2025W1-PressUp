import React from 'react';
import './KitchenOrderCard.css';
import OrderActionButton from './OrderActionButton.jsx';

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
  const { _id, table, items = [], createdAt } = order;

  return (
    <div className="kitchen-order-card">
      <div className="koc-head">
        <h3 className="koc-title">Table {table}</h3>
        <span className="koc-time">Ordered at: {formatAEST(new Date(createdAt))}</span>
      </div>

      <ul className="koc-items">
        {items.map((it, idx) => (
          <li key={it.id || idx} className="koc-item">
            <span className="koc-qty">{it.quantity}&times;</span>
            <span className="koc-name">{it.menu_item}</span>
          </li>
        ))}
      </ul>

      {/* Actions */}
      <div className="koc-actions">
        <OrderActionButton
          orderId={_id}
          methodName="orders.markClosed"
          label="Complete Order"
          className="complete"
        />
        <OrderActionButton
          orderId={_id}
          methodName="orders.markCancelled"
          label="Cancel Order"
          className="cancel"
        />
      </div>
    </div>
  );
};

export default KitchenOrderCard;
