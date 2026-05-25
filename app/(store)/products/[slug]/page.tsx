import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/store/ProductDetailClient";
import { prisma } from "@/lib/prisma";
import { decimalToNumber, getProductPrimaryImage } from "@/lib/utils";

type Params = { params: Promise<{ slug: string }> };

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;

  const product = await prisma.product.findFirst({
    where: { slug, isPublished: true },
    include: {
      category: { select: { name: true, slug: true } },
      brand: { select: { name: true, slug: true } },
      colors: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!product) notFound();
  if (product.colors.length === 0) notFound();

  const related = await prisma.product.findMany({
    where: {
      isPublished: true,
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    take: 4,
    include: { colors: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });

  return (
    <ProductDetailClient
      product={{
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        shortDescription: product.shortDescription,
        price: decimalToNumber(product.price),
        maxQuantity: product.stock,
        brand: product.brand
          ? { name: product.brand.name, slug: product.brand.slug }
          : null,
        material: product.material,
        size: product.size,
        category: product.category,
        colors: product.colors,
        inStock: product.stock > 0,
      }}
      related={related.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: decimalToNumber(p.price),
        image: getProductPrimaryImage(p.colors),
      }))}
    />
  );
}
