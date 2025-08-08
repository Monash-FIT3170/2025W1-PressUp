import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import KitchenOrderCard from './KitchenOrderCard.jsx';
import { OrdersCollection } from '/imports/api/orders/orders-collection';
import './KitchenDisplay.css';

export const KitchenDisplay = () => {
  const { orders, isLoading } = useTracker(() => {
    const sub = Meteor.subscribe('orders.active');
    const loading = !sub.ready();
    const data = OrdersCollection.find({}, { sort: { createdAt: 1 } }).fetch(); // oldest -> newest
    return { orders: data, isLoading: loading };
  });

  return (
    <div className="kitchen-page">
      <header className="kitchen-header">
        <h1>Kitchen — Open Orders</h1>
      </header>

      {isLoading ? (
        <div className="kitchen-empty">Loading orders…</div>
      ) : orders.length === 0 ? (
        <div className="kitchen-empty">No open orders.</div>
      ) : (
        <div className="kitchen-cards-row">
          {orders.map((order) => (
            <KitchenOrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default KitchenDisplay;
