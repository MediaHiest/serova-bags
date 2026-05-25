export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateOrderNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let random = "";
  for (let i = 0; i < 6; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ORD-${date}-${random}`;
}

export const FREE_SHIPPING_THRESHOLD = 5000;

export function calculateCartShippingFee(
  items: { quantity: number; shippingPrice: number }[],
  subtotal: number
): number {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return items.reduce((sum, item) => sum + item.shippingPrice * item.quantity, 0);
}

export function formatPrice(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-EG", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function getEffectivePrice(
  price: number | { toString(): string },
  salePrice?: number | { toString(): string } | null
): number {
  const base = parseFloat(price.toString());
  if (salePrice != null) {
    const sale = parseFloat(salePrice.toString());
    if (sale > 0 && sale < base) return sale;
  }
  return base;
}

export function decimalToNumber(value: { toString(): string }): number {
  return parseFloat(value.toString());
}
