import { Suspense } from "react";
import { notFound } from "next/navigation";
import ProductListing from "@/components/store/ProductListing";
import { prisma } from "@/lib/prisma";
import { decimalToNumber, getProductPrimaryImage } from "@/lib/utils";
import type { Prisma } from "@prisma/client";

interface BrandPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}

async function getBrandProducts(slug: string, page: number, sort: string) {
  const brand = await prisma.brand.findUnique({ where: { slug, isActive: true } });
  if (!brand) return null;

  const limit = 12;
  const skip = (page - 1) * limit;

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "oldest"
      ? { createdAt: "asc" }
      : sort === "price_asc"
        ? { price: "asc" }
        : sort === "price_desc"
          ? { price: "desc" }
          : { createdAt: "desc" };

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

  return {
    brand,
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: decimalToNumber(p.price),
      image: getProductPrimaryImage(p.colors),
    })),
    pagination: { page, totalPages: Math.ceil(total / limit) || 1 },
  };
}

export default async function BrandPage({ params, searchParams }: BrandPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const page = Math.max(1, parseInt(query.page ?? "1", 10));
  const sort = query.sort ?? "newest";

  const data = await getBrandProducts(slug, page, sort);
  if (!data) notFound();

  const { brand, products, pagination } = data;

  return (
    <Suspense>
      <ProductListing
        title={brand.name}
        subtitle={`Shop all products from ${brand.name}`}
        products={products}
        pagination={pagination}
        basePath={`/brands/${slug}`}
        emptyTitle={`No products from ${brand.name} yet`}
        emptyDescription="This brand has no published products at the moment. Browse our full collection in the shop."
      />
    </Suspense>
  );
}
