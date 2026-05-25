import { NextRequest } from "next/server";
import { requireUser, jsonError, jsonSuccess } from "@/lib/api-utils";
import { decimalToNumber } from "@/lib/utils";
import { getOrCreateCart, serializeCart } from "@/lib/cart-order";
import { prisma } from "@/lib/prisma";
import { cartItemUpdateSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const { error, user: session } = await requireUser();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const parsed = cartItemUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }

  const cart = await getOrCreateCart(session!.sub);
  const item = await prisma.cartItem.findFirst({
    where: { id, cartId: cart.id },
    include: { product: true },
  });
  if (!item) return jsonError("Cart item not found", 404);

  const { quantity } = parsed.data;

  if (quantity === 0) {
    await prisma.cartItem.delete({ where: { id } });
  } else {
    if (quantity > item.product.stock) {
      return jsonError("Not enough items available", 400);
    }
    const unitPrice = decimalToNumber(item.product.price);
    await prisma.cartItem.update({
      where: { id },
      data: { quantity, unitPrice },
    });
  }

  const updated = await getOrCreateCart(session!.sub);
  return jsonSuccess(serializeCart(updated));
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { error, user: session } = await requireUser();
  if (error) return error;

  const { id } = await params;
  const cart = await getOrCreateCart(session!.sub);
  const item = await prisma.cartItem.findFirst({
    where: { id, cartId: cart.id },
  });
  if (!item) return jsonError("Cart item not found", 404);

  await prisma.cartItem.delete({ where: { id } });
  const updated = await getOrCreateCart(session!.sub);
  return jsonSuccess(serializeCart(updated));
}
