export function ShippingFeeLabel() {
  return <span className="text-text-muted text-sm">At delivery</span>;
}

export function ShippingFeeHint() {
  return (
    <p className="text-xs text-text-muted leading-relaxed">
      Shipping fees are determined by the shipping provider when your order is dispatched.
    </p>
  );
}
