import { Suspense } from "react";
import ProductListing from "@/components/store/ProductListing";
import { prisma } from "@/lib/prisma";
import { decimalToNumber, getProductPrimaryImage } from "@/lib/utils";
import type { Prisma } from "@prisma/client";

interface BagsPageProps {
  searchParams: Promise<{ page?: string; sort?: string }>;
}

async function getBagProducts(page: number, sort: string) {
  const limit = 12;
  const skip = (page - 1) * limit;

  const bagCategorySlugs = [
    "all-bags",
    "tote-bags",
    "crossbody-bags",
    "clutches",
    "wallets",
    "backpacks",
    "duffle-bags",
    "laptop-bags-sleeves",
  ];

  const categories = await prisma.category.findMany({
    where: { slug: { in: bagCategorySlugs } },
    select: { id: true },
  });

  const categoryIds = categories.map((c) => c.id);

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "oldest"
      ? { createdAt: "asc" }
      : sort === "price_asc"
        ? { price: "asc" }
        : sort === "price_desc"
          ? { price: "desc" }
          : { createdAt: "desc" };

  const where = { isPublished: true, categoryId: { in: categoryIds } };

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

export default async function BagsPage({ searchParams }: BagsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const sort = params.sort ?? "newest";
  const { products, pagination } = await getBagProducts(page, sort);

  return (
    <Suspense>
      <ProductListing
        title="Bags"
        subtitle="Discover Selora's Functional Bags for Every Occasion"
        products={products}
        pagination={pagination}
        basePath="/bags"
        categorySlug="bags"
        emptyTitle="No bags available right now"
        emptyDescription="Our bag collection is being refreshed. Check back soon for new totes, crossbody bags, and more — or browse the full shop."
      />
    </Suspense>
  );
}
