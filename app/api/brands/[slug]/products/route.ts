import { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/lib/api-utils";
import { decimalToNumber, getProductPrimaryImage } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { productQuerySchema } from "@/lib/validation";

type Params = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { slug } = await params;
  const brand = await prisma.brand.findUnique({ where: { slug, isActive: true } });
  if (!brand) return jsonError("Brand not found", 404);

  const { searchParams } = new URL(request.url);
  const parsed = productQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid query", 400);
  }

  const { page, limit, sort } = parsed.data;
  const skip = (page - 1) * limit;

  const orderBy =
    sort === "oldest"
      ? { createdAt: "asc" as const }
      : sort === "price_asc"
        ? { price: "asc" as const }
        : sort === "price_desc"
          ? { price: "desc" as const }
          : { createdAt: "desc" as const };

  const where = { brandId: brand.id, isPublished: true };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: { colors: { orderBy: { sortOrder: "asc" }, take: 1 } },
    }),
    prisma.product.count({ where }),
  ]);

  return jsonSuccess({
    brand: { id: brand.id, name: brand.name, slug: brand.slug },
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: decimalToNumber(p.price),
      image: getProductPrimaryImage(p.colors),
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
