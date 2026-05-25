import { requireAdmin, jsonError, jsonSuccess } from "@/lib/api-utils";
import { decimalToNumber } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      createdAt: true,
      profile: true,
      addresses: true,
      orders: {
        orderBy: { createdAt: "desc" },
        include: { items: true },
      },
    },
  });

  if (!user) return jsonError("User not found", 404);

  return jsonSuccess({
    user: {
      ...user,
      orders: user.orders.map((o) => ({
        ...o,
        subtotal: decimalToNumber(o.subtotal),
        shippingFee: decimalToNumber(o.shippingFee),
        total: decimalToNumber(o.total),
      })),
    },
  });
}
