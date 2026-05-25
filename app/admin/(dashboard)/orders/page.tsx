"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  customerName: string;
  customerEmail: string;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    const res = await fetch(`/api/admin/orders?${params}`);
    const data = await res.json();
    setOrders(data.orders ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    load();
  }

  if (loading) return <p className="text-text-muted">Loading...</p>;

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-medium text-text-dark mb-6 sm:mb-8">Orders</h1>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6">
        <input
          className="input-field sm:max-w-xs flex-1 min-w-0"
          placeholder="Search order number, name, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input-field sm:max-w-[160px] w-full sm:w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          {["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button type="submit" className="btn-primary text-xs py-2 px-4 w-full sm:w-auto shrink-0">Search</button>
      </form>

      <div className="admin-card overflow-x-auto -mx-4 sm:mx-0 rounded-none sm:rounded-lg">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b text-left text-text-muted">
              <th className="pb-3 pr-4">Order #</th>
              <th className="pb-3 pr-4">Customer</th>
              <th className="pb-3 pr-4">Total</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3 pr-4">Payment</th>
              <th className="pb-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-gray-50">
                <td className="py-3 pr-4">
                  <Link href={`/admin/orders/${order.id}`} className="underline">{order.orderNumber}</Link>
                </td>
                <td className="py-3 pr-4">
                  <p>{order.customerName}</p>
                  <p className="text-xs text-text-muted">{order.customerEmail}</p>
                </td>
                <td className="py-3 pr-4">{formatPrice(order.total)} EGP</td>
                <td className="py-3 pr-4">{order.status}</td>
                <td className="py-3 pr-4">{order.paymentStatus}</td>
                <td className="py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
