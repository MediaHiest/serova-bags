"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import AccountPageHeader from "@/components/store/account/AccountPageHeader";
import AccountLoading from "@/components/store/account/AccountLoading";
import OrderStatusBadge from "@/components/store/account/OrderStatusBadge";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((res) => {
        if (!res.ok) {
          router.push("/account/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setOrder(data.order);
        setLoading(false);
      });
  }, [id, router]);

  if (loading) return <AccountLoading />;
  if (!order) {
    return (
      <div className="account-card p-12 text-center text-text-muted">
        <p className="text-sm">Order not found</p>
        <Link href="/account/orders" className="text-sm underline mt-4 inline-block">
          Back to orders
        </Link>
      </div>
    );
  }

  const items = order.items as Array<{
    productName: string;
    productImage: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  const address = order.addressSnapshot as Record<string, string> | null;

  return (
    <div>
      <AccountPageHeader
        title={order.orderNumber as string}
        description={new Intl.DateTimeFormat("en-EG", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(order.createdAt as string))}
        action={
          <Link href="/account/orders" className="text-xs text-text-muted hover:text-text-dark underline">
            ← All orders
          </Link>
        }
      />

      <div className="flex flex-wrap gap-2 mb-8">
        <OrderStatusBadge status={order.status as string} />
        <OrderStatusBadge status={order.paymentStatus as string} />
        {order.paymentMethod != null && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-bg-beige text-text-muted tracking-wide">
            {String(order.paymentMethod) === "COD" ? "Cash on Delivery" : String(order.paymentMethod)}
          </span>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-xs tracking-widest uppercase text-text-dark mb-2">Items</h3>
          {items.map((item, i) => (
            <div key={i} className="account-card flex gap-4 p-4">
              {item.productImage ? (
                <div className="relative w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-bg-beige">
                  <Image
                    src={item.productImage}
                    alt={item.productName}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              ) : (
                <div className="w-16 h-20 rounded-lg bg-bg-beige flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-dark">{item.productName}</p>
                <p className="text-xs text-text-muted mt-1">
                  Qty {item.quantity} · {formatPrice(item.unitPrice)} EGP each
                </p>
              </div>
              <p className="text-sm font-medium flex-shrink-0">{formatPrice(item.totalPrice)} EGP</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {address && (
            <div className="account-card p-5">
              <h3 className="text-xs tracking-widest uppercase text-text-dark mb-3">Delivery Address</h3>
              <div className="text-sm text-text-muted font-normal space-y-1">
                <p className="text-text-dark font-normal">{address.fullName}</p>
                <p>{address.phone}</p>
                <p>
                  {address.street}, {address.building}
                  {address.floor && `, Floor ${address.floor}`}
                </p>
                <p>
                  {address.area}, {address.city}
                </p>
              </div>
            </div>
          )}

          <div className="account-card p-5 space-y-2">
            <h3 className="text-xs tracking-widest uppercase text-text-dark mb-3">Order Summary</h3>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Subtotal</span>
              <span>{formatPrice(order.subtotal as number)} EGP</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Shipping</span>
              <span>
                {(order.shippingFee as number) === 0
                  ? "Free"
                  : `${formatPrice(order.shippingFee as number)} EGP`}
              </span>
            </div>
            <div className="flex justify-between font-medium pt-3 border-t border-text-dark/10">
              <span>Total</span>
              <span>{formatPrice(order.total as number)} EGP</span>
            </div>
          </div>

          <Link href="/shop" className="btn-outline block text-center text-xs py-3">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
