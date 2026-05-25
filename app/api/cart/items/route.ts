import { NextRequest } from "next/server";
import { requireUser, jsonError, jsonSuccess } from "@/lib/api-utils";
import { decimalToNumber } from "@/lib/utils";
import {
  getOrCreateCart,
  recalculateCartItemPrices,
  serializeCart,
} from "@/lib/cart-order";
import { prisma } from "@/lib/prisma";
import { cartItemSchema } from "@/lib/validation";

export async function GET() {
  const { error, user: session } = await requireUser();
  if (error) return error;

  const cart = await getOrCreateCart(session!.sub);
  await recalculateCartItemPrices(cart.id);
  const updated = await getOrCreateCart(session!.sub);
  return jsonSuccess(serializeCart(updated));
}

export async function POST(request: NextRequest) {
  const { error, user: session } = await requireUser();
  if (error) return error;

  const body = await request.json();
  const parsed = cartItemSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }

  const { productId, quantity } = parsed.data;
  const product = await prisma.product.findFirst({
    where: { id: productId, isPublished: true },
  });
  if (!product) return jsonError("Product not found", 404);
  if (product.stock < quantity) {
    return jsonError("Not enough items available", 400);
  }

  const cart = await getOrCreateCart(session!.sub);
  const unitPrice = decimalToNumber(product.price);

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  if (existing) {
    const newQty = existing.quantity + quantity;
    if (newQty > product.stock) {
      return jsonError("Not enough items available", 400);
    }
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQty, unitPrice },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity, unitPrice },
    });
  }

  const updated = await getOrCreateCart(session!.sub);
  return jsonSuccess(serializeCart(updated), 201);
}
