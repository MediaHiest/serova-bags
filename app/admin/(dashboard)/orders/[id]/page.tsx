"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatPrice } from "@/lib/utils";

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch(`/api/admin/orders/${id}`);
    const data = await res.json();
    setOrder(data.order);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function updateStatus(status: string) {
    await fetch(`/api/admin/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  async function updatePaymentStatus(paymentStatus: string) {
    await fetch(`/api/admin/orders/${id}/payment-status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentStatus }),
    });
    load();
  }

  if (loading) return <p className="text-text-muted">Loading...</p>;
  if (!order) return <p className="text-text-muted">Order not found</p>;

  const items = order.items as Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  const address = order.addressSnapshot as Record<string, string>;

  return (
    <div>
      <Link href="/admin/orders" className="text-sm text-text-muted hover:text-text-dark mb-4 inline-block">
        ← Back to Orders
      </Link>
      <h1 className="text-2xl font-medium text-text-dark mb-2">{order.orderNumber as string}</h1>
      <p className="text-sm text-text-muted mb-8">{new Date(order.createdAt as string).toLocaleString()}</p>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="admin-card">
          <h2 className="text-sm tracking-widest uppercase mb-4">Customer</h2>
          <p className="text-sm">{order.customerName as string}</p>
          <p className="text-sm text-text-muted">{order.customerEmail as string}</p>
          <p className="text-sm text-text-muted">{order.customerPhone as string}</p>

          <h2 className="text-sm tracking-widest uppercase mt-6 mb-4">Shipping Address</h2>
          <p className="text-sm text-text-muted">
            {address.fullName}<br />
            {address.street}, {address.area}<br />
            {address.city}<br />
            {address.phone}
          </p>
        </div>

        <div className="admin-card">
          <h2 className="text-sm tracking-widest uppercase mb-4">Update Status</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => (
              <button
                key={s}
                onClick={() => updateStatus(s)}
                className={`text-xs px-3 py-1 rounded border ${
                  order.status === s ? "bg-green-charcoal text-white border-green-charcoal" : "border-gray-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <h2 className="text-sm tracking-widest uppercase mb-4">Payment Status</h2>
          <div className="flex gap-2">
            {["UNPAID", "PAID", "REFUNDED"].map((s) => (
              <button
                key={s}
                onClick={() => updatePaymentStatus(s)}
                className={`text-xs px-3 py-1 rounded border ${
                  order.paymentStatus === s ? "bg-green-charcoal text-white border-green-charcoal" : "border-gray-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-card mt-8">
        <h2 className="text-sm tracking-widest uppercase mb-4">Order Items</h2>
        {items.map((item, i) => (
          <div key={i} className="flex justify-between py-2 border-b border-gray-50 text-sm">
            <span>{item.productName} × {item.quantity}</span>
            <span>{formatPrice(item.totalPrice)} EGP</span>
          </div>
        ))}
        <div className="pt-4 space-y-2 max-w-xs ml-auto">
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Subtotal</span>
            <span>{formatPrice(order.subtotal as number)} EGP</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Shipping</span>
            <span>{formatPrice(order.shippingFee as number)} EGP</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>{formatPrice(order.total as number)} EGP</span>
          </div>
        </div>
      </div>
    </div>
  );
}
