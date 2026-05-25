"use client";

import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/store/ProductCard";
import SortDropdown from "@/components/store/SortDropdown";
import Pagination from "@/components/store/Pagination";
import EmptyProductsState from "@/components/store/EmptyProductsState";

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
}

interface ProductListingProps {
  title: string;
  subtitle?: string;
  products: ProductListItem[];
  pagination: { page: number; totalPages: number };
  basePath: string;
  categorySlug?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export default function ProductListing({
  title,
  subtitle,
  products,
  pagination,
  basePath,
  categorySlug,
  emptyTitle,
  emptyDescription,
}: ProductListingProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") ?? "newest";

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16">
      <div className="text-center mb-8 sm:mb-10">
        <h1 className="page-title text-2xl sm:text-3xl md:text-5xl lg:text-6xl text-text-dark">{title}</h1>
        <div className="title-underline" />
        {subtitle && (
          <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-text-muted font-normal tracking-wide max-w-xl mx-auto leading-relaxed px-2">
            {subtitle}
          </p>
        )}
      </div>

      {products.length > 0 && (
        <SortDropdown value={sort} onChange={(v) => updateParams({ sort: v, page: "1" })} />
      )}

      {products.length === 0 ? (
        <EmptyProductsState
          title={emptyTitle ?? `No ${title.toLowerCase()} yet`}
          description={
            emptyDescription ??
            `There are no items in ${title} at the moment. New pieces are added regularly — explore our full collection in the meantime.`
          }
          categorySlug={categorySlug}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      )}

      {products.length > 0 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(page) => updateParams({ page: String(page) })}
        />
      )}
    </div>
  );
}
