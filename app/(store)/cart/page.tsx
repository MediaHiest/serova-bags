"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product: {
    name: string;
    slug: string;
    image: string | null;
  };
}

interface CartData {
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchCart() {
    const res = await fetch("/api/cart");
    if (res.status === 401) {
      router.push("/account/login?redirect=/cart");
      return;
    }
    const data = await res.json();
    setCart(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchCart();
  }, []);

  async function updateQuantity(itemId: string, quantity: number) {
    const res = await fetch(`/api/cart/items/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    const data = await res.json();
    if (res.ok) setCart(data);
  }

  async function removeItem(itemId: string) {
    const res = await fetch(`/api/cart/items/${itemId}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) setCart(data);
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-text-muted">
        Loading cart...
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="page-title text-3xl text-text-dark mb-4">Your Cart</h1>
        <p className="text-text-muted mb-8">Your cart is empty.</p>
        <Link href="/shop" className="btn-primary inline-block">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <h1 className="page-title text-3xl md:text-4xl text-text-dark text-center mb-2">Your Cart</h1>
      <div className="title-underline mb-10" />

      <div className="space-y-6 mb-10">
        {cart.items.map((item) => (
          <div key={item.id} className="flex gap-4 md:gap-6 bg-bg-off-white/50 rounded-xl p-4">
            <div className="relative w-24 h-28 rounded-lg overflow-hidden flex-shrink-0 bg-bg-pattern">
              {item.product.image && (
                <Image src={item.product.image} alt={item.product.name} fill className="object-cover" sizes="96px" />
              )}
            </div>
            <div className="flex-1">
              <Link href={`/products/${item.product.slug}`} className="text-sm text-text-dark hover:opacity-70">
                {item.product.name}
              </Link>
              <p className="text-sm text-text-muted mt-1">{formatPrice(item.unitPrice)} EGP</p>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center border border-text-dark/20">
                  <button
                    className="px-2 py-1 text-sm"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    −
                  </button>
                  <span className="px-3 text-sm">{item.quantity}</span>
                  <button
                    className="px-2 py-1 text-sm"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <button
                  className="text-xs text-text-muted hover:text-text-dark underline"
                  onClick={() => removeItem(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="text-sm font-medium text-text-dark">
              {formatPrice(item.lineTotal)} EGP
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-text-dark/10 pt-6 space-y-3 max-w-sm ml-auto">
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Subtotal</span>
          <span>{formatPrice(cart.subtotal)} EGP</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Shipping</span>
          <span>{cart.shippingFee === 0 ? "Free" : `${formatPrice(cart.shippingFee)} EGP`}</span>
        </div>
        <div className="flex justify-between text-base font-medium pt-2 border-t border-text-dark/10">
          <span>Total</span>
          <span>{formatPrice(cart.total)} EGP</span>
        </div>
        <Link href="/checkout" className="btn-primary block text-center mt-6">
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
