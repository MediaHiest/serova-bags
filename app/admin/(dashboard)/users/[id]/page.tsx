"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatPrice } from "@/lib/utils";

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/users/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p className="text-text-muted">Loading...</p>;
  if (!user) return <p className="text-text-muted">User not found</p>;

  const addresses = user.addresses as Array<Record<string, string>>;
  const orders = user.orders as Array<Record<string, unknown>>;

  return (
    <div>
      <Link href="/admin/users" className="text-sm text-text-muted hover:text-text-dark mb-4 inline-block">
        ← Back to Users
      </Link>
      <h1 className="text-2xl font-medium text-text-dark mb-2">{user.fullName as string}</h1>
      <p className="text-sm text-text-muted mb-8">{user.email as string}</p>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="admin-card">
          <h2 className="text-sm tracking-widest uppercase mb-4">Profile</h2>
          <p className="text-sm">Phone: {user.phone as string ?? "—"}</p>
          <p className="text-sm text-text-muted">Joined: {new Date(user.createdAt as string).toLocaleDateString()}</p>
        </div>

        <div className="admin-card">
          <h2 className="text-sm tracking-widest uppercase mb-4">Addresses ({addresses.length})</h2>
          {addresses.map((addr, i) => (
            <div key={i} className="text-sm text-text-muted mb-3 pb-3 border-b border-gray-50">
              <p className="font-medium text-text-dark">{addr.label}</p>
              <p>{addr.street}, {addr.area}, {addr.city}</p>
            </div>
          ))}
          {addresses.length === 0 && <p className="text-sm text-text-muted">No addresses</p>}
        </div>
      </div>

      <div className="admin-card mt-8">
        <h2 className="text-sm tracking-widest uppercase mb-4">Orders ({orders.length})</h2>
        {orders.map((order, i) => (
          <Link
            key={i}
            href={`/admin/orders/${order.id}`}
            className="flex justify-between py-2 border-b border-gray-50 text-sm hover:opacity-70"
          >
            <span>{order.orderNumber as string}</span>
            <span>{formatPrice(order.total as number)} EGP · {order.status as string}</span>
          </Link>
        ))}
        {orders.length === 0 && <p className="text-sm text-text-muted">No orders</p>}
      </div>
    </div>
  );
}
