import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 md:py-24 text-center">
      <div className="empty-products-card px-8 py-14">
        <p className="text-[10px] tracking-[0.25em] uppercase text-text-muted mb-6">404</p>

        <h1 className="page-title text-3xl md:text-4xl text-text-dark mb-4">
          Product Not Available
        </h1>
        <div className="title-underline mb-6" />

        <p className="text-sm text-text-muted font-normal leading-relaxed max-w-md mx-auto mb-10">
          This item may have sold out, been removed, or the link might be incorrect. Discover
          our current collection of locally crafted bags and accessories.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/shop" className="btn-primary text-xs py-3 px-8 w-full sm:w-auto">
            Shop All
          </Link>
          <Link href="/bags" className="btn-outline text-xs py-3 px-8 w-full sm:w-auto">
            Browse Bags
          </Link>
        </div>
      </div>

      <p className="mt-10 text-xs text-text-muted">
        Need help?{" "}
        <Link href="/our-story" className="text-text-dark underline underline-offset-4">
          Contact us through Our Story
        </Link>
      </p>
    </div>
  );
}
