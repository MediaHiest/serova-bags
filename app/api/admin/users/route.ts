import { NextRequest } from "next/server";
import { requireAdmin, jsonSuccess } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "20", 10);
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        createdAt: true,
        _count: { select: { orders: true, addresses: true } },
      },
    }),
    prisma.user.count(),
  ]);

  return jsonSuccess({
    users,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
