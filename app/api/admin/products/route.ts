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
        colors: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.product.count(),
  ]);

  return jsonSuccess({
    products: products.map((p) => ({
      ...p,
      price: decimalToNumber(p.price),
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

  const { colors, ...productData } = data;

  const product = await prisma.product.create({
    data: {
      ...productData,
      slug,
      colors: {
        create: colors.map((c, i) => ({
          name: c.name,
          imageUrl: c.imageUrl,
          sortOrder: c.sortOrder ?? i,
        })),
      },
    },
    include: { colors: { orderBy: { sortOrder: "asc" } }, category: true },
  });

  return jsonSuccess(
    {
      product: {
        ...product,
        price: decimalToNumber(product.price),
      },
    },
    201
  );
}
