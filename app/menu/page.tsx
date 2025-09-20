'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onStatusUpdate: (orderId: string, newStatus: string) => void;
  onCancelOrder?: (orderId: string) => void;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// --- helper: resolve storage path to usable URL (public => signed)
async function resolveStorageUrl(path?: string | null, bucket = 'menu-images', signedExpirySec = 60 * 60 * 24) {
  if (!path) return null;
  // if already a full URL
  if (typeof path === 'string' && /^(https?:)?\/\//i.test(path)) return path;

  try {
    // try public url
    const publicResp: any = await supabase.storage.from(bucket).getPublicUrl(path);
    const publicUrl = publicResp?.data?.publicUrl || publicResp?.publicURL || null;
    if (publicUrl) return publicUrl;

    // fallback: create signed url
    const signedResp: any = await supabase.storage.from(bucket).createSignedUrl(path, signedExpirySec);
    const signedUrl = signedResp?.data?.signedUrl || signedResp?.signedURL || null;
    if (signedUrl) return signedUrl;
  } catch (err) {
    console.warn('resolveStorageUrl error', err);
  }

  return null;
}

// --- helper: batch enrich items using menu_items.image_url and resolve storage URLs
async function enrichAndResolveItemImages(items: any[]) {
  if (!Array.isArray(items) || items.length === 0) return [];

  // gather numeric ids
  const ids = items.map((i) => Number(i.id)).filter(Boolean);
  let menuMap = new Map<string, string>();

  if (ids.length) {
    try {
      const { data: menuRows, error } = await supabase
        .from('menu_items')
        .select('id, image_url')
        .in('id', ids);

      if (!error && Array.isArray(menuRows)) {
        menuMap = new Map(menuRows.map((r: any) => [String(r.id), r.image_url]));
      }
    } catch (err) {
      console.warn('Failed to fetch menu_items', err);
    }
  }

  const resolved = await Promise.all(
    items.map(async (item) => {
      try {
        const imgField = item.image || undefined;
        // 1) if item.image is full url -> use it
        if (imgField && typeof imgField === 'string' && /^(https?:)?\/\//i.test(imgField)) {
          return { ...item, imageResolved: imgField };
        }

        // 2) if item.image is a storage path -> try resolve
        if (imgField && typeof imgField === 'string' && imgField.trim() !== '') {
          const resolvedUrl = await resolveStorageUrl(imgField);
          if (resolvedUrl) return { ...item, imageResolved: resolvedUrl };
        }

        // 3) try menu_items.image_url lookup
        const menuImg = menuMap.get(String(item.id));
        if (menuImg) {
          if (/^(https?:)?\/\//i.test(menuImg)) {
            return { ...item, imageResolved: menuImg };
          }
          const resolvedFromMenu = await resolveStorageUrl(menuImg);
          if (resolvedFromMenu) return { ...item, imageResolved: resolvedFromMenu };
        }
      } catch (err) {
        console.warn('error resolving image for item', item, err);
      }

      // no image found -> undefined (UI will fallback)
      return { ...item, imageResolved: undefined };
    })
  );

  return resolved;
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
  const [resolvedItems, setResolvedItems] = useState<any[]>([]);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    if (order) {
      setStatus(order.status || 'placed');
      setNotes(order.notes || '');
    }
  }, [order]);

  // resolve images when order.items change
  useEffect(() => {
    let mounted = true;
    (async () => {
      setResolving(true);
      try {
        const items = Array.isArray(order?.items) ? order.items : [];
        const enriched = await enrichAndResolveItemImages(items);
        if (mounted) setResolvedItems(enriched);
      } catch (err) {
        console.error('Failed to enrich/resolve images', err);
        if (mounted) setResolvedItems(order?.items || []);
      } finally {
        if (mounted) setResolving(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [order?.items]);

  if (!isOpen || !order) return null;

  const statusOptions = [
    { value: 'placed', label: 'Order Placed' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready' },
    { value: 'on-the-way', label: 'On the Way' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const handleStatusUpdate = () => {
    onStatusUpdate(order.id, status);
    try {
      const allOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');
      const updatedOrders = allOrders.map((o: any) =>
        o.id === order.id ? { ...o, status, notes } : o
      );
      localStorage.setItem('allOrders', JSON.stringify(updatedOrders));
    } catch (e) {}
    try {
      const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
      const updatedUserOrders = userOrders.map((o: any) =>
        o.id === order.id ? { ...o, status, notes } : o
      );
      localStorage.setItem('userOrders', JSON.stringify(updatedUserOrders));
    } catch (e) {}
    onClose();
  };

  const handleCancel = async () => {
    if (onCancelOrder) {
      try {
        onCancelOrder(order.id);
      } catch (err) {
        console.error('onCancelOrder threw:', err);
      }
      onClose();
      return;
    }

    const newStatus = 'cancelled';
    onStatusUpdate(order.id, newStatus);

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

    setStatus(newStatus);
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
        return { label: s || 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const { label, color } = getStatusInfo(status);
  const orderDate = order.orderDate || order.created_at || order.createdAt || new Date().toISOString();

  // choose which list to render: resolvedItems (if ready) else fallback to order.items
  const itemsToRender = resolvedItems.length ? resolvedItems : (order.items || []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                <p className="text-gray-600">{new Date(orderDate).toLocaleString()}</p>
              </div>
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

          {/* Customer Information */}
          <div className="space-y-8">
            <section>
              <h4 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Customer Information</h4>
              <div className="bg-white rounded-xl shadow-sm p-5 space-y-3 border border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name:</span>
                  <span className="font-medium">{order.customer?.firstName} {order.customer?.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-medium">{order.customer?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone:</span>
                  <span className="font-medium">{order.customer?.phone || order.phone}</span>
                </div>
                {/* {order.orderType === 'delivery' && order.address && (
                  <div className="flex justify-between items-start">
                    <span className="text-gray-500">Address:</span>
                    <span className="font-medium text-right">
                      {order.address?.street}, {order.address?.city}, {order.address?.state} {order.address?.zipCode}
                    </span>
                  </div>
                )} */}





{/* Delivery address (robust / tolerant) */}
{(
  // determine if this is a delivery order (accept different naming)
  ((order.orderType || order.order_type || order.order_type === 'delivery') || '')
    .toString()
    .toLowerCase() === 'delivery'
) && (() => {
  // normalize address from multiple possible places
  const addr =
    order.address ||
    order.delivery_address ||
    order.deliveryAddress ||
    order.delivery ||
    // sometimes stored directly on order as fields
    (order.delivery_street || order.address_street ? {
      street: order.delivery_street || order.address_street,
      city: order.delivery_city || order.address_city,
      state: order.delivery_state || order.address_state,
      zipCode: order.delivery_zipCode || order.address_zipCode || order.delivery_zip || order.zipCode
    } : null);

  // helper to check if any address part exists
  const hasAddr = addr && (addr.street || addr.city || addr.state || addr.zipCode || addr.postal || addr.pincode);

  return (
    <div className="flex justify-between items-start">
      <span className="text-gray-500">Address:</span>

      <span className="font-medium text-right max-w-[60%]">
        {hasAddr ? (
          <>
            {addr.street ? <>{addr.street}{addr.city || addr.state || addr.zipCode ? ', ' : ''}</> : null}
            {addr.city ? <>{addr.city}{addr.state || addr.zipCode ? ', ' : ''}</> : null}
            {addr.state ? <>{addr.state}{addr.zipCode ? ' ' : ''}</> : null}
            {addr.zipCode || addr.postal || addr.pincode ? <>{addr.zipCode || addr.postal || addr.pincode}</> : null}
          </>
        ) : (
          <span className="text-gray-400">Address not available</span>
        )}
      </span>
    </div>
  );
})()}









              </div>
            </section>

            {/* Items */}


{/* Items — bill / receipt style */}
<div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
  <h3 className="text-lg font-semibold mb-4 flex items-center">
    <i className="ri-restaurant-line text-orange-600 mr-2"></i>
    Order Items ({itemsToRender.length})
    {resolving && <span className="ml-3 text-sm text-gray-500">resolving images…</span>}
  </h3>

  {/* table header */}
  <div className="grid grid-cols-12 gap-2 text-sm text-gray-500 border-b pb-2 mb-3">
    <div className="col-span-1 text-left">#</div>
   
    <div className="col-span-6 text-left">Item</div>
     <div className="col-span-2 text-left">Qty</div>
    <div className="col-span-2 text-right">Price</div>
    <div className="col-span-1 text-right">Total</div>
  </div>

  {/* items list */}
  <div className="space-y-2">
    {itemsToRender.map((item: any, index: number) => {
      const qty = Number(item.quantity || 1);
      const price = Number(item.price || 0);
      const total = qty * price;
      const imgSrc =
        (item.imageResolved && item.imageResolved.trim() !== '')
          ? item.imageResolved
          : (item.image && item.image.trim() !== '')
          ? item.image
          : `https://readdy.ai/api/search-image?query=delicious%20nepali%20food%20dish%20${encodeURIComponent(item.name || '')}&width=60&height=60&seq=order-item-${index}`;

      return (
        <div key={index} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="col-span-1 text-sm text-gray-600">{index + 1}</div>


          <div className="col-span-6 flex items-center space-x-3">
            <img
              src={imgSrc}
              alt={item.name}
              className="w-10 h-10 object-cover rounded-md flex-shrink-0"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).onerror = null;
                (e.currentTarget as HTMLImageElement).src = '/images/placeholder-food.png';
              }}
            />
            <div>
              
              <div className="font-medium text-gray-800">{item.name}</div>
              {item.notes && <div className="text-xs text-gray-500 mt-0.5">{item.notes}</div>}
            </div>
          </div>

          <div className="col-span-2 text-sm text-gray-700 font-medium">{qty}</div>


          <div className="col-span-2 text-right font-mono text-sm text-gray-700">₨{price.toLocaleString()}</div>

          <div className="col-span-1 text-right font-mono font-semibold text-gray-800">₨{total.toLocaleString()}</div>
        </div>
      );
    })}
  </div>


              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <i></i>
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Items Subtotal</span>
                  <span className="font-semibold">₨{(order.subtotal || (order.total || 0)).toLocaleString()}</span>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">Total Amount</span>
                    <span className="text-2xl font-bold text-orange-600">₨{(order.total || 0).toLocaleString()}</span>
                  </div>
                  <div className="mt-2 flex justify-between items-center text-sm">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-medium text-gray-800">{order.paymentMethod || order.payment_method || 'Cash on Delivery'}</span>
                  </div>
                </div>
              </div>







            </div>



            {/* Status Update */}
            <section>
              <h4 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Update Status</h4>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Order Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Notes (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about this order..."
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none bg-white"
                    rows={3}
                    maxLength={500}
                  />
                </div>
              </div>
            </section>
          </div>
        </div>

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
