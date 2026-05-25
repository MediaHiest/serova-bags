"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice, qualifiesForFreeShipping } from "@/lib/utils";
import { FreeShippingProgress, ShippingFeeLabel } from "@/components/store/ShippingFeeHint";

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
  itemCount?: number;
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M14 18h20l-1.8 11H15.8L14 18z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M14 18l-1.2-4H10M20 18V14a4 4 0 0 1 8 0v4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="18" cy="33" r="1.5" fill="currentColor" />
      <circle cx="30" cy="33" r="1.5" fill="currentColor" />
    </svg>
  );
}

function CartLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="text-center mb-12">
        <div className="h-10 w-48 bg-text-dark/5 rounded mx-auto mb-3 animate-pulse" />
        <div className="h-1 w-10 bg-text-dark/10 rounded mx-auto" />
      </div>
      <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
        <div className="lg:col-span-3 space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="cart-item-card p-5 flex gap-5 animate-pulse">
              <div className="w-28 h-32 rounded-xl bg-bg-pattern shrink-0" />
              <div className="flex-1 space-y-3 py-1">
                <div className="h-4 w-2/3 bg-text-dark/10 rounded" />
                <div className="h-3 w-1/4 bg-text-dark/5 rounded" />
                <div className="h-8 w-28 bg-text-dark/5 rounded-full" />
              </div>
            </div>
          ))}
        </div>
        <div className="lg:col-span-2">
          <div className="cart-summary-card p-8 h-72 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function CartEmpty() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="empty-products-card max-w-lg mx-auto text-center px-8 py-14">
        <div className="empty-products-icon mx-auto mb-8">
          <CartIcon />
        </div>
        <h1 className="page-title text-3xl md:text-4xl text-text-dark mb-3">Your Cart</h1>
        <p className="text-base text-text-muted font-normal leading-relaxed max-w-sm mx-auto mb-8">
          Your bag is empty. Discover our collection of premium bags and accessories crafted in Egypt.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/shop" className="btn-primary text-xs py-3 px-8 w-full sm:w-auto text-center">
            Shop All
          </Link>
          <Link href="/bags" className="btn-outline text-xs py-3 px-8 w-full sm:w-auto text-center">
            Explore Bags
          </Link>
        </div>
        <div className="pt-8 mt-8 border-t border-text-dark/10">
          <p className="text-[10px] tracking-[0.2em] uppercase text-text-muted mb-4">
            You might also like
          </p>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            <Link
              href="/shop?category=tote-bags"
              className="text-xs text-text-muted hover:text-text-dark transition-colors underline underline-offset-4"
            >
              Tote Bags
            </Link>
            <Link
              href="/our-story"
              className="text-xs text-text-muted hover:text-text-dark transition-colors underline underline-offset-4"
            >
              Our Story
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
    if (quantity < 0) return;
    setUpdatingId(itemId);
    const res = await fetch(`/api/cart/items/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    const data = await res.json();
    if (res.ok) setCart(data);
    setUpdatingId(null);
  }

  async function removeItem(itemId: string) {
    setUpdatingId(itemId);
    const res = await fetch(`/api/cart/items/${itemId}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) setCart(data);
    setUpdatingId(null);
  }

  if (loading) return <CartLoading />;
  if (!cart || cart.items.length === 0) return <CartEmpty />;

  const totalPieces = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16 pb-28 lg:pb-16">
      <header className="text-center mb-10 md:mb-12">
        <h1 className="page-title text-3xl md:text-4xl lg:text-5xl text-text-dark mb-2">
          Your Cart
        </h1>
        <div className="title-underline" />
        <p className="mt-5 text-sm text-text-muted tracking-wide">
          {totalPieces} {totalPieces === 1 ? "item" : "items"} · {cart.items.length}{" "}
          {cart.items.length === 1 ? "product" : "products"}
        </p>
      </header>

      <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">
        {/* Line items */}
        <div className="lg:col-span-3 space-y-4 md:space-y-5">
          {cart.items.map((item) => {
            const isUpdating = updatingId === item.id;
            return (
              <article
                key={item.id}
                className={`cart-item-card p-4 md:p-5 flex gap-4 md:gap-6 ${
                  isUpdating ? "opacity-60 pointer-events-none" : ""
                }`}
              >
                <Link
                  href={`/products/${item.product.slug}`}
                  className="relative w-24 h-28 md:w-28 md:h-32 rounded-xl overflow-hidden shrink-0 bg-bg-pattern group"
                >
                  {item.product.image ? (
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 96px, 112px"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-text-muted">
                      No image
                    </div>
                  )}
                </Link>

                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex justify-between gap-4 items-start">
                    <div className="min-w-0">
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="text-base md:text-lg font-medium text-text-dark hover:text-green-charcoal transition-colors line-clamp-2 leading-snug"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-text-muted mt-1">
                        {formatPrice(item.unitPrice)} EGP each
                      </p>
                    </div>
                    <p className="text-base font-semibold text-text-dark shrink-0 hidden sm:block">
                      {formatPrice(item.lineTotal)} EGP
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 mt-auto pt-4">
                    <div className="flex items-center gap-4">
                      <div className="cart-quantity-control">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          disabled={isUpdating}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          disabled={isUpdating}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className="text-xs tracking-wide text-text-muted hover:text-text-dark underline underline-offset-4 transition-colors"
                        disabled={isUpdating}
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                    <p className="text-base font-semibold text-text-dark sm:hidden">
                      {formatPrice(item.lineTotal)} EGP
                    </p>
                  </div>
                </div>
              </article>
            );
          })}

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-dark transition-colors mt-2 group"
          >
            <span className="transition-transform group-hover:-translate-x-0.5" aria-hidden>
              ←
            </span>
            Continue shopping
          </Link>
        </div>

        {/* Order summary */}
        <aside className="lg:col-span-2">
          <div className="cart-summary-card p-6 md:p-8 lg:sticky lg:top-28">
            <h2 className="text-sm tracking-widest uppercase text-text-dark font-medium mb-6">
              Order Summary
            </h2>

            <div className="mb-6">
              <FreeShippingProgress subtotal={cart.subtotal} />
            </div>

            <div className="space-y-3 pb-5 mb-5 border-b border-text-dark/10">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-3 text-sm">
                  <span className="text-text-muted truncate flex-1">
                    {item.product.name}
                    <span className="text-text-muted/80"> × {item.quantity}</span>
                  </span>
                  <span className="text-text-dark font-medium shrink-0">
                    {formatPrice(item.lineTotal)} EGP
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-base">
                <span className="text-text-muted">Subtotal</span>
                <span className="text-text-dark">{formatPrice(cart.subtotal)} EGP</span>
              </div>
              <div className="flex justify-between text-base items-start gap-3">
                <span className="text-text-muted">Shipping</span>
                <ShippingFeeLabel subtotal={cart.subtotal} />
              </div>
              <div className="flex justify-between text-lg font-semibold pt-4 border-t border-text-dark/10">
                <span className="text-text-dark">Total</span>
                <span className="text-text-dark">{formatPrice(cart.subtotal)} EGP</span>
              </div>
              <p className="text-xs text-text-muted text-center pt-1">
                {qualifiesForFreeShipping(cart.subtotal)
                  ? "Free shipping included · Cash on delivery available"
                  : "Shipping at delivery unless order exceeds 10,000 EGP"}
              </p>
            </div>

            <Link href="/checkout" className="btn-primary hidden lg:block text-center w-full mt-8">
              Proceed to Checkout
            </Link>

            <p className="text-[10px] tracking-[0.15em] uppercase text-text-muted text-center mt-5">
              Secure checkout · Free returns on eligible items
            </p>
          </div>
        </aside>
      </div>

      <div className="mobile-sticky-bar lg:hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wide">Total</p>
            <p className="text-lg font-semibold text-text-dark">{formatPrice(cart.subtotal)} EGP</p>
          </div>
          <Link href="/checkout" className="btn-primary shrink-0 text-center py-3 px-6">
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
