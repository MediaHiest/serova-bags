import { requireUser, jsonSuccess } from "@/lib/api-utils";
import { getOrCreateCart, serializeCart } from "@/lib/cart-order";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  const { error, user: session } = await requireUser();
  if (error) return error;

  const cart = await getOrCreateCart(session!.sub);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  const updated = await getOrCreateCart(session!.sub);
  return jsonSuccess(serializeCart(updated));
}
