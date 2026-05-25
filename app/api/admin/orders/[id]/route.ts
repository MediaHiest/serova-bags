import { requireAdmin, jsonError, jsonSuccess } from "@/lib/api-utils";
import { decimalToNumber } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          addresses: true,
        },
      },
    },
  });

  if (!order) return jsonError("Order not found", 404);

  return jsonSuccess({
    order: {
      ...order,
      subtotal: decimalToNumber(order.subtotal),
      shippingFee: decimalToNumber(order.shippingFee),
      discount: decimalToNumber(order.discount),
      total: decimalToNumber(order.total),
      items: order.items.map((i) => ({
        ...i,
        unitPrice: decimalToNumber(i.unitPrice),
        totalPrice: decimalToNumber(i.totalPrice),
      })),
    },
  });
}
