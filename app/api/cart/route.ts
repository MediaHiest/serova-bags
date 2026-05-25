import { requireUser } from "@/lib/api-utils";
import {
  getOrCreateCart,
  recalculateCartItemPrices,
  serializeCart,
} from "@/lib/cart-order";

export async function GET() {
  const { error, user: session } = await requireUser();
  if (error) return error;

  const cart = await getOrCreateCart(session!.sub);
  await recalculateCartItemPrices(cart.id);
  const updated = await getOrCreateCart(session!.sub);
  const { jsonSuccess } = await import("@/lib/api-utils");
  return jsonSuccess(serializeCart(updated));
}
