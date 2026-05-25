"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

const navLinks = [
  { href: "/shop", label: "Shop All" },
  { href: "/bags", label: "Bags" },
  { href: "/shop?category=footwear", label: "Footwear" },
  { href: "/shop?category=clothing", label: "Clothing" },
  { href: "/shop?category=accessories", label: "Accessories" },
  { href: "/shop?category=sale", label: "Sale" },
];

function IconSearch() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
    </svg>
  );
}

function IconCart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
      <path d="M6 6h15l-1.5 9h-12z" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
      <path d="M6 6L5 3H2" />
    </svg>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isActive = (() => {
    if (href === "/shop" && pathname === "/shop" && !searchParams.get("category")) return true;
    if (href === "/bags" && pathname === "/bags") return true;
    if (href.includes("category=")) {
      const cat = href.split("category=")[1];
      return pathname === "/shop" && searchParams.get("category") === cat;
    }
    return pathname === href;
  })();

  return (
    <Link href={href} className={`site-nav-link ${isActive ? "site-nav-link-active" : ""}`}>
      {label}
    </Link>
  );
}

function NavbarContent() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="site-header sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14">
        {/* Desktop — single row: logo | nav | utilities */}
        <div className="hidden lg:block site-nav-inner">
          <Link href="/" className="site-nav-logo hover:opacity-85 transition-opacity">
            Selora Brand
          </Link>

          <nav className="site-nav-links" aria-label="Main navigation">
            {navLinks.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </nav>

          <div className="site-nav-utilities">
            <button
              type="button"
              className="site-nav-locale"
              aria-label="Select language"
            >
              English
              <svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor" aria-hidden>
                <path d="M2 3.5L5 6.5L8 3.5" />
              </svg>
            </button>
            <div className="site-nav-icons">
              <Link href="/account" className="site-nav-icon" aria-label="Account">
                <IconUser />
              </Link>
              <Link href="/shop" className="site-nav-icon" aria-label="Search">
                <IconSearch />
              </Link>
              <Link href="/cart" className="site-nav-icon" aria-label="Cart">
                <IconCart />
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div className="lg:hidden flex items-center justify-between min-h-[4rem] py-3">
          <button
            type="button"
            className="site-nav-icon p-1"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
              {mobileOpen ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <>
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </>
              )}
            </svg>
          </button>

          <Link href="/" className="site-nav-logo text-[1.6rem]">
            Selora Brand
          </Link>

          <div className="site-nav-icons">
            <Link href="/account" className="site-nav-icon" aria-label="Account">
              <IconUser />
            </Link>
            <Link href="/cart" className="site-nav-icon" aria-label="Cart">
              <IconCart />
            </Link>
          </div>
        </div>

        {mobileOpen && (
          <nav
            className="lg:hidden pb-6 flex flex-col items-center gap-4 border-t border-text-dark/10 pt-5"
            aria-label="Mobile navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="site-nav-link"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <button type="button" className="site-nav-locale">
              English
              <svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor">
                <path d="M2 3.5L5 6.5L8 3.5" />
              </svg>
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={<header className="site-header h-[4.5rem]" />}>
      <NavbarContent />
    </Suspense>
  );
}
