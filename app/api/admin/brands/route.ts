import { NextRequest } from "next/server";
import { requireAdmin, jsonError, jsonSuccess } from "@/lib/api-utils";
import { slugify } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { brandSchema } from "@/lib/validation";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return jsonSuccess({ brands });
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const parsed = brandSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }

  const data = parsed.data;
  const slug = data.slug || slugify(data.name);

  const existing = await prisma.brand.findUnique({ where: { slug } });
  if (existing) return jsonError("Slug already exists", 409);

  const brand = await prisma.brand.create({
    data: { ...data, slug },
  });

  return jsonSuccess({ brand }, 201);
}
