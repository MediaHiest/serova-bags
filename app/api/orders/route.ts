import { NextRequest } from "next/server";
import { requireUser, jsonError, jsonSuccess } from "@/lib/api-utils";
import { decimalToNumber } from "@/lib/utils";
import { createOrderFromCart } from "@/lib/cart-order";
import { checkoutSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const { error, user: session } = await requireUser();
  if (error) return error;

  const body = await request.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }

  try {
    const order = await createOrderFromCart({
      userId: session!.sub,
      addressId: parsed.data.addressId,
      paymentMethod: parsed.data.paymentMethod,
      notes: parsed.data.notes,
    });

    return jsonSuccess(
      {
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          total: decimalToNumber(order.total),
        },
      },
      201
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Order creation failed";
    return jsonError(message, 400);
  }
}

export async function GET() {
  const { error, user: session } = await requireUser();
  if (error) return error;

  const { prisma } = await import("@/lib/prisma");
  const orders = await prisma.order.findMany({
    where: { userId: session!.sub },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return jsonSuccess({
    orders: orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      paymentStatus: o.paymentStatus,
      total: decimalToNumber(o.total),
      itemCount: o.items.length,
      createdAt: o.createdAt,
    })),
  });
}
