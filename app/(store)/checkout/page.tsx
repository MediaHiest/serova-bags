"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  city: string;
  area: string;
  street: string;
  building: string;
  isDefault: boolean;
}

interface CartItem {
  product: { name: string; image: string | null };
  quantity: number;
  lineTotal: number;
  unitPrice: number;
}

interface CartSummary {
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
}

const addressFields = [
  { key: "label", label: "Label", placeholder: "Home, Work..." },
  { key: "fullName", label: "Full Name", placeholder: "Recipient name" },
  { key: "phone", label: "Phone", placeholder: "+20 ..." },
  { key: "city", label: "City", placeholder: "Cairo" },
  { key: "area", label: "Area", placeholder: "District / area" },
  { key: "street", label: "Street", placeholder: "Street address" },
  { key: "building", label: "Building", placeholder: "Building no." },
] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    label: "Home",
    fullName: "",
    phone: "",
    city: "",
    area: "",
    street: "",
    building: "",
  });

  useEffect(() => {
    async function load() {
      const [authRes, cartRes, addrRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/cart"),
        fetch("/api/user/addresses"),
      ]);

      if (!authRes.ok) {
        router.push("/account/login?redirect=/checkout");
        return;
      }

      if (cartRes.ok) {
        const cartData = await cartRes.json();
        if (!cartData.items?.length) {
          router.push("/cart");
          return;
        }
        setCart(cartData);
      }

      if (addrRes.ok) {
        const addrData = await addrRes.json();
        setAddresses(addrData.addresses ?? []);
        const defaultAddr = addrData.addresses?.find((a: Address) => a.isDefault);
        if (defaultAddr) setSelectedAddress(defaultAddr.id);
        else if (addrData.addresses?.length) setSelectedAddress(addrData.addresses[0].id);
        else setShowAddressForm(true);
      }

      setLoading(false);
    }
    load();
  }, [router]);

  async function handleAddAddress(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/user/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...addressForm, isDefault: addresses.length === 0 }),
    });
    const data = await res.json();
    if (res.ok) {
      setAddresses((prev) => [...prev, data.address]);
      setSelectedAddress(data.address.id);
      setShowAddressForm(false);
      setAddressForm({
        label: "Home",
        fullName: "",
        phone: "",
        city: "",
        area: "",
        street: "",
        building: "",
      });
    }
  }

  async function placeOrder() {
    if (!selectedAddress) {
      setError("Please select or add a delivery address");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId: selectedAddress,
          paymentMethod: "COD",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to place order");
        return;
      }
      router.push(`/order-success?orderNumber=${data.order.orderNumber}`);
    } catch {
      setError("Failed to place order");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 flex flex-col items-center text-text-muted">
        <div className="w-8 h-8 border-2 border-green-charcoal/20 border-t-green-charcoal rounded-full animate-spin mb-4" />
        <p className="text-base">Preparing checkout...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div className="text-center mb-10 md:mb-14">
        <h1 className="page-title text-3xl md:text-4xl text-text-dark">Checkout</h1>
        <div className="title-underline" />
        <p className="mt-5 text-base text-text-muted font-normal max-w-md mx-auto">
          Review your order and confirm delivery details
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8 lg:gap-10">
        {/* Left — delivery & payment */}
        <div className="lg:col-span-3 space-y-8">
          {/* Delivery address */}
          <section className="account-card p-6 md:p-8">
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="text-sm tracking-widest uppercase text-text-dark font-medium">
                Delivery Address
              </h2>
              {addresses.length > 0 && !showAddressForm && (
                <button
                  type="button"
                  className="text-sm text-green-charcoal font-medium hover:opacity-70 transition-opacity"
                  onClick={() => setShowAddressForm(true)}
                >
                  + New address
                </button>
              )}
            </div>

            {addresses.length > 0 && (
              <div className="space-y-3 mb-2">
                {addresses.map((addr) => {
                  const selected = selectedAddress === addr.id;
                  return (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => setSelectedAddress(addr.id)}
                      className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                        selected
                          ? "border-green-charcoal bg-bg-off-white shadow-sm"
                          : "border-text-dark/8 bg-transparent hover:border-text-dark/20"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                            selected ? "border-green-charcoal" : "border-text-muted/40"
                          }`}
                        >
                          {selected && (
                            <div className="w-2.5 h-2.5 rounded-full bg-green-charcoal" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-medium text-text-dark">{addr.label}</span>
                            {addr.isDefault && (
                              <span className="text-[10px] tracking-widest uppercase bg-green-charcoal/10 text-green-charcoal px-2 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-base text-text-dark mt-1">{addr.fullName}</p>
                          <p className="text-sm text-text-muted mt-1 leading-relaxed">
                            {addr.street}, {addr.building}
                            <br />
                            {addr.area}, {addr.city}
                            <br />
                            {addr.phone}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {showAddressForm && (
              <form
                onSubmit={handleAddAddress}
                className={`space-y-4 ${addresses.length > 0 ? "mt-6 pt-6 border-t border-text-dark/10" : ""}`}
              >
                <p className="text-sm font-medium text-text-dark">
                  {addresses.length === 0 ? "Add your delivery address" : "Add a new address"}
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {addressFields.map(({ key, label, placeholder }) => (
                    <div key={key} className={key === "street" ? "sm:col-span-2" : ""}>
                      <label className="input-label" htmlFor={`checkout-${key}`}>
                        {label}
                      </label>
                      <input
                        id={`checkout-${key}`}
                        className="input-field"
                        placeholder={placeholder}
                        value={addressForm[key]}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, [key]: e.target.value })
                        }
                        required
                      />
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button type="submit" className="btn-primary text-sm py-3 px-6">
                    Save Address
                  </button>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      className="btn-outline text-sm py-3 px-6"
                      onClick={() => setShowAddressForm(false)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </section>

          {/* Payment — COD only */}
          <section className="account-card p-6 md:p-8">
            <h2 className="text-sm tracking-widest uppercase text-text-dark font-medium mb-5">
              Payment Method
            </h2>
            <div className="flex items-start gap-4 p-5 rounded-xl border-2 border-green-charcoal bg-bg-off-white">
              <div className="w-10 h-10 rounded-full bg-green-charcoal/10 flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-green-charcoal">
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <path d="M2 10h20" />
                </svg>
              </div>
              <div>
                <p className="text-base font-medium text-text-dark">Cash on Delivery</p>
                <p className="text-sm text-text-muted mt-1 leading-relaxed">
                  Pay when your order arrives. We&apos;ll confirm your order by email.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Right — order summary */}
        <div className="lg:col-span-2">
          <div className="account-card p-6 md:p-8 lg:sticky lg:top-28">
            <h2 className="text-sm tracking-widest uppercase text-text-dark font-medium mb-6">
              Order Summary
            </h2>

            {cart && (
              <>
                <div className="space-y-4 max-h-64 overflow-y-auto pr-1 mb-6">
                  {cart.items.map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-bg-beige flex-shrink-0">
                        {item.product.image ? (
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="w-full h-full bg-bg-pattern" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-dark leading-snug line-clamp-2">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-text-muted mt-1">Qty {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-text-dark flex-shrink-0">
                        {formatPrice(item.lineTotal)} EGP
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-4 border-t border-text-dark/10">
                  <div className="flex justify-between text-base">
                    <span className="text-text-muted">Subtotal</span>
                    <span className="text-text-dark">{formatPrice(cart.subtotal)} EGP</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-text-muted">Shipping</span>
                    <span className="text-text-dark">
                      {cart.shippingFee === 0 ? (
                        <span className="text-green-charcoal font-medium">Free</span>
                      ) : (
                        `${formatPrice(cart.shippingFee)} EGP`
                      )}
                    </span>
                  </div>
                  {cart.subtotal >= 5000 && cart.shippingFee === 0 && (
                    <p className="text-xs text-green-charcoal bg-green-charcoal/5 rounded-lg px-3 py-2">
                      Free shipping applied on orders above 5,000 EGP
                    </p>
                  )}
                  <div className="flex justify-between text-lg font-semibold pt-3 border-t border-text-dark/10">
                    <span className="text-text-dark">Total</span>
                    <span className="text-text-dark">{formatPrice(cart.total)} EGP</span>
                  </div>
                </div>
              </>
            )}

            {error && (
              <p className="text-red-600 text-sm mt-4 bg-red-50 rounded-lg px-4 py-3">{error}</p>
            )}

            <button
              type="button"
              onClick={placeOrder}
              disabled={submitting || !selectedAddress}
              className="btn-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Placing Order..." : "Place Order"}
            </button>

            <Link
              href="/cart"
              className="block text-center text-sm text-text-muted mt-5 hover:text-text-dark transition-colors"
            >
              ← Back to Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
