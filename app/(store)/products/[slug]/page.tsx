import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/store/ProductDetailClient";
import { prisma } from "@/lib/prisma";
import { decimalToNumber, getEffectivePrice } from "@/lib/utils";

type Params = { params: Promise<{ slug: string }> };

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;

  const product = await prisma.product.findFirst({
    where: { slug, isPublished: true },
    include: {
      category: { select: { name: true, slug: true } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: {
      isPublished: true,
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    take: 4,
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
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
        salePrice: product.salePrice ? decimalToNumber(product.salePrice) : null,
        effectivePrice: getEffectivePrice(product.price, product.salePrice),
        maxQuantity: product.stock,
        brand: product.brand,
        material: product.material,
        color: product.color,
        size: product.size,
        category: product.category,
        images: product.images,
        inStock: product.stock > 0,
      }}
      related={related.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: decimalToNumber(p.price),
        salePrice: p.salePrice ? decimalToNumber(p.salePrice) : null,
        effectivePrice: getEffectivePrice(p.price, p.salePrice),
        image: p.images[0]?.url ?? null,
      }))}
    />
  );
}
