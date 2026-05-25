import { requireUser, jsonError, jsonSuccess } from "@/lib/api-utils";
import { decimalToNumber } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { error, user: session } = await requireUser();
  if (error) return error;

  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, userId: session!.sub },
    include: { items: true },
  });

  if (!order) return jsonError("Order not found", 404);

  return jsonSuccess({
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      subtotal: decimalToNumber(order.subtotal),
      shippingFee: decimalToNumber(order.shippingFee),
      discount: decimalToNumber(order.discount),
      total: decimalToNumber(order.total),
      addressSnapshot: order.addressSnapshot,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      notes: order.notes,
      createdAt: order.createdAt,
      items: order.items.map((i) => ({
        id: i.id,
        productName: i.productName,
        productImage: i.productImage,
        quantity: i.quantity,
        unitPrice: decimalToNumber(i.unitPrice),
        totalPrice: decimalToNumber(i.totalPrice),
      })),
    },
  });
}
