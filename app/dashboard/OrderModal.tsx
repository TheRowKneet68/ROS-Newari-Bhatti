
'use client';

import { useState, useEffect } from 'react';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onStatusUpdate: (orderId: string, newStatus: string) => void;
}

export default function OrderModal({ isOpen, onClose, order, onStatusUpdate }: OrderModalProps) {
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
    { value: 'placed', label: 'Order Placed', color: 'bg-blue-100 text-blue-800' },
    { value: 'preparing', label: 'Preparing', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'ready', label: 'Ready', color: 'bg-green-100 text-green-800' },
    { value: 'on-the-way', label: 'On the Way', color: 'bg-purple-100 text-purple-800' },
    { value: 'completed', label: 'Completed', color: 'bg-gray-100 text-gray-800' }
  ];

  const handleStatusUpdate = () => {
    onStatusUpdate(order.id, status);
    
    // Update in localStorage
    const allOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');
    const updatedOrders = allOrders.map((o: any) => 
      o.id === order.id ? { ...o, status, notes } : o
    );
    localStorage.setItem('allOrders', JSON.stringify(updatedOrders));
    
    // Also update user orders
    const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    const updatedUserOrders = userOrders.map((o: any) => 
      o.id === order.id ? { ...o, status, notes } : o
    );
    localStorage.setItem('userOrders', JSON.stringify(updatedUserOrders));
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
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
                <p className="text-gray-600">{new Date(order.orderDate).toLocaleString()}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                statusOptions.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800'
              }`}>
                {statusOptions.find(s => s.value === status)?.label || status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Order Type:</span>
                <span className="ml-2 font-medium capitalize">{order.orderType}</span>
              </div>
              <div>
                <span className="text-gray-500">Payment:</span>
                <span className="ml-2 font-medium">{order.paymentMethod}</span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Customer Information</h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{order.customer.firstName} {order.customer.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{order.customer.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium">{order.customer.phone || order.phone}</span>
              </div>
              {order.orderType === 'delivery' && order.address && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Address:</span>
                  <span className="font-medium text-right">
                    {order.address.street}, {order.address.city}, {order.address.state} {order.address.zipCode}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Order Items</h4>
            <div className="space-y-3">
              {order.items.map((item: any, index: number) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <h5 className="font-medium">{item.name}</h5>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-sm text-gray-600">Price: ₨{item.price.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-600">₨{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Total */}
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₨{order.subtotal?.toLocaleString() || (order.total - (order.deliveryFee || 0) - (order.tax || 0)).toLocaleString()}</span>
              </div>
              {order.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span>₨{order.deliveryFee.toLocaleString()}</span>
                </div>
              )}
              {order.tax > 0 && (
                <div className="flex justify-between">
                  <span>VAT (13%):</span>
                  <span>₨{order.tax.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span className="text-orange-600">₨{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

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

        <div className="sticky bottom-0 bg-white border-t p-6 rounded-b-2xl">
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              onClick={handleStatusUpdate}
              className="flex-1 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              Update Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
