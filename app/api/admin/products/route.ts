import { NextRequest } from "next/server";
import { requireAdmin, jsonError, jsonSuccess } from "@/lib/api-utils";
import { decimalToNumber, slugify } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "20", 10);
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true, slug: true } },
        images: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.product.count(),
  ]);

  return jsonSuccess({
    products: products.map((p) => ({
      ...p,
      price: decimalToNumber(p.price),
      salePrice: p.salePrice ? decimalToNumber(p.salePrice) : null,
      shippingPrice: decimalToNumber(p.shippingPrice),
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }

  const data = parsed.data;
  const slug = data.slug || slugify(data.name);

  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) return jsonError("Slug already exists", 409);

  const { images, ...productData } = data;

  const product = await prisma.product.create({
    data: {
      ...productData,
      slug,
      images: images?.length
        ? { create: images.map((img, i) => ({ ...img, sortOrder: img.sortOrder ?? i })) }
        : undefined,
    },
    include: { images: true, category: true },
  });

  return jsonSuccess({ product }, 201);
}
