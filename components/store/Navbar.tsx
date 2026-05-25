"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import BrandLogo from "@/components/store/BrandLogo";
import LogoutButton from "@/components/store/LogoutButton";

const navLinks = [
  { href: "/shop", label: "Shop All" },
  { href: "/bags", label: "Bags" },
  { href: "/shop?category=footwear", label: "Footwear" },
  { href: "/shop?category=clothing", label: "Clothing" },
  { href: "/shop?category=accessories", label: "Accessories" },
  { href: "/shop?category=sale", label: "Sale" },
];

const mobileMenuLinks = [
  { href: "/shop", label: "Shop All" },
  { href: "/bags", label: "Bags" },
  { href: "/our-story", label: "Our Story" },
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

function NavLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick?: () => void;
}) {
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
    <Link
      href={href}
      onClick={onClick}
      className={`site-nav-link ${isActive ? "site-nav-link-active" : ""}`}
    >
      {label}
    </Link>
  );
}

function NavbarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => setIsLoggedIn(res.ok))
      .catch(() => setIsLoggedIn(false));
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  return (
    <header className="site-header sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
        {/* Desktop */}
        <div className="hidden lg:grid site-nav-inner w-full">
          <BrandLogo
            variant="navbar"
            href="/"
            className="site-nav-logo logo-blend-screen hover:opacity-85 transition-opacity"
            imageClassName="h-9 lg:h-10 w-auto max-w-[200px]"
            priority
          />

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
        <div className="lg:hidden relative">
          <div className="grid grid-cols-[2.5rem_1fr_auto] items-center min-h-[4rem] py-3 gap-2">
            <button
              type="button"
              className="site-nav-icon p-1 justify-self-start"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
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

            <BrandLogo
              variant="navbar"
              href="/"
              className="site-nav-logo logo-blend-screen justify-self-center"
              imageClassName="h-8 w-auto max-w-[140px] sm:max-w-[160px]"
              priority
            />

            <div className="site-nav-icons justify-self-end">
              <Link href="/account" className="site-nav-icon" aria-label="Account">
                <IconUser />
              </Link>
              <Link href="/cart" className="site-nav-icon" aria-label="Cart">
                <IconCart />
              </Link>
            </div>
          </div>

          {mobileOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 top-[4rem] bg-black/20 z-40"
                aria-label="Close menu"
                onClick={closeMobileMenu}
              />
              <nav
                className="absolute left-0 right-0 top-full z-50 border-t border-text-dark/10 bg-bg-beige shadow-lg"
                aria-label="Mobile navigation"
              >
                <div className="px-4 py-5 flex flex-col items-center gap-4">
                  {mobileMenuLinks.map((link) => (
                    <NavLink key={link.href} {...link} onClick={closeMobileMenu} />
                  ))}
                  <div className="w-full border-t border-text-dark/10 pt-4 mt-1 flex flex-col items-center gap-4">
                    {isLoggedIn === true && (
                      <>
                        <Link
                          href="/account"
                          className="site-nav-link"
                          onClick={closeMobileMenu}
                        >
                          Account
                        </Link>
                        <LogoutButton
                          label="Logout"
                          className="site-nav-link"
                          onLoggedOut={closeMobileMenu}
                        />
                      </>
                    )}
                    {isLoggedIn === false && (
                      <>
                        <Link
                          href="/account/login"
                          className="site-nav-link"
                          onClick={closeMobileMenu}
                        >
                          Login
                        </Link>
                        <Link
                          href="/account/register"
                          className="site-nav-link"
                          onClick={closeMobileMenu}
                        >
                          Register
                        </Link>
                      </>
                    )}
                    <button type="button" className="site-nav-locale">
                      English
                      <svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor">
                        <path d="M2 3.5L5 6.5L8 3.5" />
                      </svg>
                    </button>
                  </div>
                </div>
              </nav>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={<header className="site-header h-[4rem] lg:h-[4.5rem]" />}>
      <NavbarContent />
    </Suspense>
  );
}
