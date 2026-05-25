import { Suspense } from "react";
import ProductListing from "@/components/store/ProductListing";
import { prisma } from "@/lib/prisma";
import { decimalToNumber, getProductPrimaryImage } from "@/lib/utils";
import type { Prisma } from "@prisma/client";

interface ShopPageProps {
  searchParams: Promise<{ page?: string; sort?: string; category?: string }>;
}

async function getProducts(page: number, sort: string, categorySlug?: string) {
  const limit = 12;
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = { isPublished: true };

  if (categorySlug && categorySlug !== "all-bags") {
    const cat = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (cat) where.categoryId = cat.id;
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "oldest"
      ? { createdAt: "asc" }
      : sort === "price_asc"
        ? { price: "asc" }
        : sort === "price_desc"
          ? { price: "desc" }
          : { createdAt: "desc" };

  const [products, total, category] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: { colors: { orderBy: { sortOrder: "asc" }, take: 1 } },
    }),
    prisma.product.count({ where }),
    categorySlug
      ? prisma.category.findUnique({ where: { slug: categorySlug } })
      : null,
  ]);

  return {
    title: category?.name ?? "Shop All",
    subtitle: category
      ? `Discover Serova's ${category.name}`
      : "Discover Serova's Collection",
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

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const sort = params.sort ?? "newest";
  const { title, subtitle, products, pagination } = await getProducts(
    page,
    sort,
    params.category
  );

  return (
    <Suspense>
      <ProductListing
        title={title}
        subtitle={subtitle}
        products={products}
        pagination={pagination}
        basePath="/shop"
        categorySlug={params.category}
      />
    </Suspense>
  );
}
