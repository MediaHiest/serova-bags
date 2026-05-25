import Link from "next/link";
import ProductCard from "@/components/store/ProductCard";
import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/utils";

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { isPublished: true, isFeatured: true },
    take: 6,
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });
}

async function getNewArrivals() {
  return prisma.product.findMany({
    where: { isPublished: true },
    take: 3,
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });
}

async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true, slug: { not: "all-bags" } },
    take: 4,
    orderBy: { name: "asc" },
  });
}

export default async function HomePage() {
  const [featured, newArrivals, categories] = await Promise.all([
    getFeaturedProducts(),
    getNewArrivals(),
    getCategories(),
  ]);

  const mapProduct = (p: Awaited<ReturnType<typeof getFeaturedProducts>>[0]) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: decimalToNumber(p.price),
    salePrice: p.salePrice ? decimalToNumber(p.salePrice) : null,
    image: p.images[0]?.url ?? null,
  });

  return (
    <>
      <section className="relative py-20 md:py-32 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="page-title text-4xl md:text-5xl lg:text-6xl text-text-dark mb-6 leading-tight">
            Carry Your Style Anywhere with Selora&apos;s Premium Bags
          </h1>
          <p className="text-base md:text-lg text-text-muted font-normal leading-relaxed mb-10 max-w-xl mx-auto">
            Elevate your everyday look with our collection of premium bags. From sleek totes to
            versatile crossbody designs, each piece is crafted to make a statement.
          </p>
          <Link href="/shop" className="btn-primary inline-block">
            Shop All
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="page-title text-3xl md:text-4xl text-center text-text-dark mb-2">Featured Categories</h2>
        <div className="title-underline mb-10" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="bg-bg-off-white rounded-2xl p-8 text-center hover:opacity-80 transition-opacity"
            >
              <span className="text-base tracking-widest uppercase text-text-dark font-medium">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="page-title text-3xl md:text-4xl text-center text-text-dark mb-2">New Arrivals</h2>
        <div className="title-underline mb-10" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {newArrivals.map((p) => (
            <ProductCard key={p.id} {...mapProduct(p)} />
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="page-title text-3xl md:text-4xl text-text-dark mb-4">Style That Speaks Volumes</h2>
            <p className="text-base md:text-lg text-text-muted font-normal leading-relaxed">
              Made with durable, high-quality materials, these bags are built to withstand your
              busiest days. Rain or shine, they&apos;ll protect your belongings while keeping you
              looking polished.
            </p>
          </div>
          <div className="bg-bg-off-white rounded-2xl aspect-[4/3] flex items-center justify-center">
            <span className="page-title text-2xl text-text-muted">Selora Brand</span>
          </div>
        </div>

        <h2 className="page-title text-3xl md:text-4xl text-center text-text-dark mb-2">Best Sellers</h2>
        <div className="title-underline mb-10" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {featured.map((p) => (
            <ProductCard key={p.id} {...mapProduct(p)} />
          ))}
        </div>
        <div className="text-center mt-12">
          <Link href="/shop" className="btn-outline inline-block">
            Shop All
          </Link>
        </div>
      </section>
    </>
  );
}
