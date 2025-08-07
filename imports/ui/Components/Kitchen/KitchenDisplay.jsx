import React, { useState } from 'react';
import KitchenOrderCard from './KitchenOrderCard.jsx';

export const KitchenDisplay = () => {
  // Mock data (replace with API call in production)
  const [orders, setOrders] = useState([
    {
      id: '1',
      tableNumber: 1,
      items: [
        { name: 'Burger', quantity: 2 },
        { name: 'Fries', quantity: 1 },
      ],
      status: 'Pending',
      timestamp: new Date().toISOString(),
    },
    {
      id: '2',
      tableNumber: 3,
      items: [
        { name: 'Pizza', quantity: 1 },
        { name: 'Salad', quantity: 2 },
      ],
      status: 'In Progress',
      timestamp: new Date(Date.now() - 600000).toISOString(),
    },
  ]);

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    // In production, call API to update status, e.g.:
    // fetch(`/api/orders/${orderId}`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) });
  };

  return (
    <div className="kitchen-display container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Kitchen Orders</h1>
      <div className="card-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.length === 0 ? (
          <p className="text-gray-600">No orders to display.</p>
        ) : (
          orders.map(order => (
            <KitchenOrderCard
              key={order.id}
              order={order}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
};
