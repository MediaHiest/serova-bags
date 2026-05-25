import { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/lib/api-utils";
import { decimalToNumber, getProductPrimaryImage } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { productQuerySchema } from "@/lib/validation";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = productQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid query", 400);
  }

  const { page, limit, sort, category, featured, search } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = { isPublished: true };

  if (category) {
    const cat = await prisma.category.findFirst({
      where: { OR: [{ slug: category }, { name: { equals: category, mode: "insensitive" } }] },
    });
    if (cat && cat.slug !== "all-bags") {
      where.categoryId = cat.id;
    }
  }

  if (featured) where.isFeatured = true;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "oldest"
      ? { createdAt: "asc" }
      : sort === "price_asc"
        ? { price: "asc" }
        : sort === "price_desc"
          ? { price: "desc" }
          : { createdAt: "desc" };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        category: { select: { name: true, slug: true } },
        colors: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return jsonSuccess({
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      shortDescription: p.shortDescription,
      price: decimalToNumber(p.price),
      category: p.category,
      brand: p.brand,
      material: p.material,
      size: p.size,
      isFeatured: p.isFeatured,
      image: getProductPrimaryImage(p.colors),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
