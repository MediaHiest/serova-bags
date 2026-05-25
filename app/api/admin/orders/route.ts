import { NextRequest } from "next/server";
import { requireAdmin, jsonSuccess } from "@/lib/api-utils";
import { decimalToNumber } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import type { OrderStatus, PaymentStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "20", 10);
  const status = searchParams.get("status") as OrderStatus | null;
  const search = searchParams.get("search") ?? "";
  const skip = (page - 1) * limit;

  const where = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { orderNumber: { contains: search, mode: "insensitive" as const } },
            { customerName: { contains: search, mode: "insensitive" as const } },
            { customerEmail: { contains: search, mode: "insensitive" as const } },
            { customerPhone: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { items: true, user: { select: { id: true, fullName: true, email: true } } },
    }),
    prisma.order.count({ where }),
  ]);

  return jsonSuccess({
    orders: orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      paymentStatus: o.paymentStatus,
      total: decimalToNumber(o.total),
      customerName: o.customerName,
      customerEmail: o.customerEmail,
      itemCount: o.items.length,
      createdAt: o.createdAt,
      user: o.user,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
