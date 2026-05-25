import { jsonError, jsonSuccess } from "@/lib/api-utils";
import { decimalToNumber, getProductPrimaryImage } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;

  const product = await prisma.product.findFirst({
    where: { slug, isPublished: true },
    include: {
      category: { select: { name: true, slug: true } },
      colors: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!product) return jsonError("Product not found", 404);

  const related = await prisma.product.findMany({
    where: {
      isPublished: true,
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    take: 4,
    include: { colors: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });

  return jsonSuccess({
    product: {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription,
      price: decimalToNumber(product.price),
      sku: product.sku,
      brand: product.brand,
      material: product.material,
      size: product.size,
      category: product.category,
      colors: product.colors,
      inStock: product.stock > 0,
    },
    related: related.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: decimalToNumber(p.price),
      image: getProductPrimaryImage(p.colors),
    })),
  });
}
