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

export function formatPrice(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-EG", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function decimalToNumber(value: { toString(): string }): number {
  return parseFloat(value.toString());
}

export const FREE_SHIPPING_THRESHOLD = 10000;

export function qualifiesForFreeShipping(subtotal: number): boolean {
  return subtotal >= FREE_SHIPPING_THRESHOLD;
}

export function getProductPrimaryImage(
  colors: { imageUrl: string; sortOrder: number }[] | null | undefined
): string | null {
  if (!colors?.length) return null;
  const sorted = [...colors].sort((a, b) => a.sortOrder - b.sortOrder);
  return sorted[0]?.imageUrl ?? null;
}
