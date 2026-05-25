"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import AccountPageHeader from "@/components/store/account/AccountPageHeader";
import AccountLoading from "@/components/store/account/AccountLoading";
import OrderStatusBadge from "@/components/store/account/OrderStatusBadge";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  itemCount: number;
  createdAt: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => {
        if (!res.ok) {
          router.push("/account/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setOrders(data.orders ?? []);
        setLoading(false);
      });
  }, [router]);

  if (loading) return <AccountLoading />;

  return (
    <div>
      <AccountPageHeader
        title="My Orders"
        description="Track your orders and view order details."
      />

      {orders.length === 0 ? (
        <div className="account-card p-12 text-center">
          <p className="text-sm text-text-muted mb-2">No orders yet</p>
          <p className="text-xs text-text-muted font-normal mb-6">
            When you place an order, it will appear here.
          </p>
          <Link href="/shop" className="btn-primary inline-block text-xs py-2 px-6">
            Browse Collection
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="account-card block p-5 hover:opacity-85 transition-opacity"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-text-dark">{order.orderNumber}</p>
                  <p className="text-xs text-text-muted mt-1">
                    {new Intl.DateTimeFormat("en-EG", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(order.createdAt))}
                    {" · "}
                    {order.itemCount} item{order.itemCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-4 sm:justify-end w-full sm:w-auto">
                  <div className="flex flex-wrap gap-2">
                    <OrderStatusBadge status={order.status} />
                    <OrderStatusBadge status={order.paymentStatus} />
                  </div>
                  <p className="text-sm font-medium">
                    {formatPrice(order.total)} EGP
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
