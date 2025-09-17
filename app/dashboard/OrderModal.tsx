'use client';

import { useState, useEffect } from 'react';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onStatusUpdate: (orderId: string, newStatus: string) => void;
  onCancelOrder?: (orderId: string) => void; // optional: parent can handle cancellation
}

export default function OrderModal({
  isOpen,
  onClose,
  order,
  onStatusUpdate,
  onCancelOrder
}: OrderModalProps) {
  const [status, setStatus] = useState(order?.status || 'placed');
  const [notes, setNotes] = useState(order?.notes || '');

  useEffect(() => {
    if (order) {
      setStatus(order.status || 'placed');
      setNotes(order.notes || '');
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const statusOptions = [
    { value: 'placed', label: 'Order Placed' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready' },
    { value: 'on-the-way', label: 'On the Way' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // internal update handler (used by Update Order button)
  const handleStatusUpdate = () => {
    // call parent to update DB/edge function
    onStatusUpdate(order.id, status);

    // sync local copies
    try {
      const allOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');
      const updatedOrders = allOrders.map((o: any) =>
        o.id === order.id ? { ...o, status, notes } : o
      );
      localStorage.setItem('allOrders', JSON.stringify(updatedOrders));
    } catch (e) {
      // ignore
    }

    try {
      const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
      const updatedUserOrders = userOrders.map((o: any) =>
        o.id === order.id ? { ...o, status, notes } : o
      );
      localStorage.setItem('userOrders', JSON.stringify(updatedUserOrders));
    } catch (e) {
      // ignore
    }

    onClose();
  };

  const getStatusInfo = (s: string) => {
    switch ((s || '').toLowerCase()) {
      case 'placed': 
        return { label: 'Placed', color: 'bg-blue-400 text-blue-800' };
      case 'preparing': 
        return { label: 'Preparing', color: 'bg-yellow-400 text-yellow-800' };
      case 'ready': 
        return { label: 'Ready', color: 'bg-orange-400 text-orange-800' };
      case 'on-the-way': 
        return { label: 'On the Way', color: 'bg-purple-400 text-purple-800' };
      case 'completed': 
        return { label: 'Completed', color: 'bg-green-400 text-green-800' };
      case 'cancelled': 
        return { label: 'Cancelled', color: 'bg-red-400 text-red-800' };
      case 'delivery': 
        return { label: 'Delivery', color: 'bg-teal-400 text-teal-800' };
      case 'pickup': 
        return { label: 'Pickup', color: 'bg-cyan-400 text-cyan-800' };
      default: 
        return { label: s, color: 'bg-gray-100 text-gray-800' };
    }
  };


  // internal cancel handler — DOES NOT mutate props
  const handleCancel = async () => {
    // If parent supplied onCancelOrder, let it handle cancellation (e.g. show confirm, update DB)
    if (onCancelOrder) {
      try {
        onCancelOrder(order.id);
      } catch (err) {
        console.error('onCancelOrder threw:', err);
      }
      onClose();
      return;
    }

    // Otherwise do a simple cancel here by calling onStatusUpdate with 'cancelled'
    const newStatus = 'cancelled';
    onStatusUpdate(order.id, newStatus);

    // sync local copies
    try {
      const allOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');
      const updatedOrders = allOrders.map((o: any) =>
        o.id === order.id ? { ...o, status: newStatus, notes } : o
      );
      localStorage.setItem('allOrders', JSON.stringify(updatedOrders));
    } catch (e) {}

    try {
      const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
      const updatedUserOrders = userOrders.map((o: any) =>
        o.id === order.id ? { ...o, status: newStatus, notes } : o
      );
      localStorage.setItem('userOrders', JSON.stringify(updatedUserOrders));
    } catch (e) {}

    // update local state so UI shows Cancelled immediately
    setStatus(newStatus);

    onClose();
  };

  // derive label/color for badge
  const { label, color } = getStatusInfo(status);

  // date fallback
  const orderDate = order.orderDate || order.created_at || order.createdAt || new Date().toISOString();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Header */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                <p className="text-gray-600">{new Date(orderDate).toLocaleString()}</p>
              </div>

              {/* status badge */}
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${color}`}>
                {label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Order Type:</span>
                <span className="ml-2 font-medium capitalize">{order.orderType || order.order_type || ''}</span>
              </div>
              <div>
                <span className="text-gray-500">Payment:</span>
                <span className="ml-2 font-medium">{order.paymentMethod || order.payment_method || '—'}</span>
              </div>
            </div>
          </div>

          {/* ... rest of UI (customer info, items, totals) ... */}

          {/* Status Update */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Update Status</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Order Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this order..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                  rows={3}
                  maxLength={500}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-6 rounded-b-2xl">
          <div className="flex space-x-4">
            <button onClick={onClose} className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50">
              Close
            </button>

            {order?.status !== 'cancelled' && (
              <button
                onClick={handleCancel}
                className="px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 cursor-pointer"
              >
                <i className="ri-close-circle-line mr-1"></i> Cancel
              </button>
            )}

            <button onClick={handleStatusUpdate} className="flex-1 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700">
              Update Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
