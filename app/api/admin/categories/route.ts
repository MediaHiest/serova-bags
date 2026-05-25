import { NextRequest } from "next/server";
import { requireAdmin, jsonError, jsonSuccess } from "@/lib/api-utils";
import { slugify } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validation";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return jsonSuccess({ categories });
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }

  const data = parsed.data;
  const slug = data.slug || slugify(data.name);

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) return jsonError("Slug already exists", 409);

  const category = await prisma.category.create({
    data: { ...data, slug, imageUrl: data.imageUrl || undefined },
  });

  return jsonSuccess({ category }, 201);
}
