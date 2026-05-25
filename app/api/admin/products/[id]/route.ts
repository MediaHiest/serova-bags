import { NextRequest } from "next/server";
import { requireAdmin, jsonError, jsonSuccess } from "@/lib/api-utils";
import { decimalToNumber } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { colors: { orderBy: { sortOrder: "asc" } }, category: true, brand: true },
  });
  if (!product) return jsonError("Product not found", 404);

  return jsonSuccess({
    product: {
      ...product,
      price: decimalToNumber(product.price),
    },
  });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return jsonError("Product not found", 404);

  const body = await request.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }

  const { colors, ...productData } = parsed.data;

  if (productData.slug !== existing.slug) {
    const slugTaken = await prisma.product.findUnique({ where: { slug: productData.slug } });
    if (slugTaken) return jsonError("Slug already exists", 409);
  }

  const product = await prisma.$transaction(async (tx) => {
    await tx.productColor.deleteMany({ where: { productId: id } });
    await tx.productColor.createMany({
      data: colors.map((c, i) => ({
        productId: id,
        name: c.name,
        imageUrl: c.imageUrl,
        sortOrder: c.sortOrder ?? i,
      })),
    });

    return tx.product.update({
      where: { id },
      data: productData,
      include: { colors: { orderBy: { sortOrder: "asc" } }, category: true, brand: true },
    });
  });

  return jsonSuccess({
    product: {
      ...product,
      price: decimalToNumber(product.price),
    },
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return jsonSuccess({ message: "Product deleted" });
}
