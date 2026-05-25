import { NextRequest } from "next/server";
import { requireAdmin, jsonError, jsonSuccess } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { brandSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const parsed = brandSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }

  const data = parsed.data;
  const brand = await prisma.brand.update({
    where: { id },
    data,
  });

  return jsonSuccess({ brand });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const productCount = await prisma.product.count({ where: { brandId: id } });
  if (productCount > 0) {
    return jsonError("Cannot delete brand with existing products", 400);
  }

  await prisma.brand.delete({ where: { id } });
  return jsonSuccess({ message: "Brand deleted" });
}
