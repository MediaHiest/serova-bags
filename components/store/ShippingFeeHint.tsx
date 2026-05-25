import { formatPrice, FREE_SHIPPING_THRESHOLD, qualifiesForFreeShipping } from "@/lib/utils";

export function ShippingFeeLabel({ subtotal }: { subtotal: number }) {
  if (qualifiesForFreeShipping(subtotal)) {
    return <span className="text-green-charcoal font-medium text-sm">Free</span>;
  }
  return <span className="text-text-muted text-sm">At delivery</span>;
}

export function ShippingFeeHint({ subtotal }: { subtotal: number }) {
  if (qualifiesForFreeShipping(subtotal)) {
    return (
      <p className="text-xs text-green-charcoal bg-green-charcoal/5 rounded-lg px-3 py-2">
        Free shipping applied on orders above {formatPrice(FREE_SHIPPING_THRESHOLD)} EGP
      </p>
    );
  }

  return (
    <p className="text-xs text-text-muted leading-relaxed">
      Shipping fees are determined by the shipping provider when your order is dispatched.
      Free shipping on orders above {formatPrice(FREE_SHIPPING_THRESHOLD)} EGP.
    </p>
  );
}

export function FreeShippingProgress({ subtotal }: { subtotal: number }) {
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const qualified = qualifiesForFreeShipping(subtotal);

  if (qualified) {
    return (
      <div className="rounded-xl bg-green-charcoal/5 border border-green-charcoal/15 px-4 py-3">
        <p className="text-sm text-green-charcoal font-medium">
          You&apos;ve unlocked free shipping
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-bg-off-white/80 border border-text-dark/8 px-4 py-3">
      <div className="flex justify-between items-baseline gap-2 mb-2">
        <p className="text-xs text-text-muted tracking-wide">
          {formatPrice(remaining)} EGP away from free shipping
        </p>
        <p className="text-[10px] tracking-widest uppercase text-text-muted">
          {Math.round(progress)}%
        </p>
      </div>
      <div className="h-1.5 rounded-full bg-text-dark/8 overflow-hidden">
        <div
          className="h-full rounded-full bg-green-charcoal transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
