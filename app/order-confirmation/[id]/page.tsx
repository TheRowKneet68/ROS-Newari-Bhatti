'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import Header from "@/components/Header";
import Link from "next/link";

export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) {
        console.error("Error loading order:", error);
      } else {
        setOrder(data);
      }
      setLoading(false);
    }

    loadOrder();
  }, [params.id]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!order) return <p className="p-6 text-red-500">Order not found</p>;

  // compute delivery ETA
  const currentTime = new Date();
  const estimatedDeliveryTime = new Date(
    currentTime.getTime() + (order.estimatedTime || 30) * 60000
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
        <p className="mb-6">Order #{order.orderNumber}</p>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <p><strong>Delivery Address:</strong> {order.address}</p>
          <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
          <p><strong>Estimated Delivery:</strong> {estimatedDeliveryTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>

          <hr className="my-4" />

          <h3 className="font-semibold mb-2">Items</h3>
          <ul className="space-y-2">
            {order.items.map((item: any, i: number) => (
              <li key={i} className="flex justify-between">
                <span>{item.quantity}x {item.name}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>

          <hr className="my-4" />

          <div className="flex justify-between">
            <span>Total</span>
            <span className="font-bold">${order.total.toFixed(2)}</span>
          </div>
        </div>

        <Link
          href={`/track-order/${order.id}`}
          className="mt-6 block bg-orange-600 text-white py-3 rounded-lg text-center"
        >
          Track Order
        </Link>
      </div>
    </div>
  );
}
