import Link from "next/link";

interface EmptyProductsStateProps {
  title?: string;
  description?: string;
  categorySlug?: string;
}

export default function EmptyProductsState({
  title = "No products found",
  description = "We couldn't find any items in this collection right now. Explore our other categories or check back soon for new arrivals.",
  categorySlug,
}: EmptyProductsStateProps) {
  const suggestions = [
    { href: "/shop", label: "Shop All" },
    { href: "/bags", label: "Browse Bags" },
    { href: "/shop?category=sale", label: "View Sale" },
    { href: "/our-story", label: "Our Story" },
  ].filter((link) => {
    if (!categorySlug) return true;
    if (link.href === `/shop?category=${categorySlug}`) return false;
    if (categorySlug === "bags" && link.href === "/bags") return false;
    return true;
  });

  return (
    <div className="empty-products py-10 md:py-16">
      <div className="empty-products-card max-w-lg mx-auto text-center px-8 py-14">
        <div className="empty-products-icon mx-auto mb-8">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden>
            <path
              d="M14 18h20l-1.8 11H15.8L14 18z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <path
              d="M14 18l-1.2-4H10M20 18V14a4 4 0 0 1 8 0v4"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="18" cy="33" r="1.5" fill="currentColor" />
            <circle cx="30" cy="33" r="1.5" fill="currentColor" />
          </svg>
        </div>

        <h2 className="page-title text-2xl md:text-3xl text-text-dark mb-4">{title}</h2>
          <p className="text-sm text-text-muted mt-2 font-normal leading-relaxed max-w-sm mx-auto mb-8">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <Link href="/shop" className="btn-primary text-xs py-3 px-8 w-full sm:w-auto text-center">
            Shop All
          </Link>
          <Link href="/bags" className="btn-outline text-xs py-3 px-8 w-full sm:w-auto text-center">
            Explore Bags
          </Link>
        </div>

        <div className="pt-8 border-t border-text-dark/10">
          <p className="text-[10px] tracking-[0.2em] uppercase text-text-muted mb-4">
            You might also like
          </p>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            {suggestions.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-text-muted hover:text-text-dark transition-colors underline underline-offset-4"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
