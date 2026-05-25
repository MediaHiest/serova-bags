import { NextRequest } from "next/server";
import { requireAdmin, jsonError, jsonSuccess } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }

  const data = parsed.data;
  const category = await prisma.category.update({
    where: { id },
    data: { ...data, imageUrl: data.imageUrl || null },
  });

  return jsonSuccess({ category });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    return jsonError("Cannot delete category with existing products", 400);
  }

  await prisma.category.delete({ where: { id } });
  return jsonSuccess({ message: "Category deleted" });
}
