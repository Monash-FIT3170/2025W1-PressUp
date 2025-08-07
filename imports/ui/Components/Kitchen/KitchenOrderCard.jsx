import React from 'react';

const KitchenOrderCard = ({ order, onStatusChange }) => {
  const { tableNumber, items, status, timestamp } = order;

  const handleStatusChange = (newStatus) => {
    onStatusChange(order.id, newStatus);
  };

  return (
    <div className="kitchen-order-card bg-white border border-gray-200 rounded-lg shadow-md p-4 m-2 w-80">
      <div className="card-header flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold">Table {tableNumber}</h3>
        <span className={`status-badge text-sm px-2 py-1 rounded ${status === 'Completed' ? 'bg-green-100 text-green-800' : status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
          {status}
        </span>
      </div>
      <div className="card-body">
        <p className="text-sm text-gray-600 mb-2">Ordered: {new Date(timestamp).toLocaleTimeString()}</p>
        <ul className="items-list mb-3">
          {items.map((item, index) => (
            <li key={index} className="text-sm">{item.quantity}x {item.name}</li>
          ))}
        </ul>
        <div className="status-buttons flex gap-2">
          <button
            className={`px-3 py-1 rounded text-sm ${status === 'Pending' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'}`}
            onClick={() => handleStatusChange('Pending')}
            disabled={status === 'Pending'}
          >
            Pending
          </button>
          <button
            className={`px-3 py-1 rounded text-sm ${status === 'In Progress' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'}`}
            onClick={() => handleStatusChange('In Progress')}
            disabled={status === 'In Progress'}
          >
            In Progress
          </button>
          <button
            className={`px-3 py-1 rounded text-sm ${status === 'Completed' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'}`}
            onClick={() => handleStatusChange('Completed')}
            disabled={status === 'Completed'}
          >
            Completed
          </button>
        </div>
      </div>
    </div>
  );
};

export default KitchenOrderCard;