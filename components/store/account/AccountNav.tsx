"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/store/LogoutButton";

const navItems = [
  {
    href: "/account",
    label: "Overview",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    exact: true,
  },
  {
    href: "/account/orders",
    label: "My Orders",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 6h15l-1.5 9h-12z" />
        <circle cx="9" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
      </svg>
    ),
  },
  {
    href: "/account/addresses",
    label: "Addresses",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  },
  {
    href: "/account/profile",
    label: "Profile",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
];

interface AccountNavProps {
  userName: string;
  userEmail: string;
}

export default function AccountNav({ userName, userEmail }: AccountNavProps) {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <nav className="flex flex-col h-full">
      <div className="mb-8 pb-6 border-b border-text-dark/10">
        <div className="w-12 h-12 rounded-full bg-green-charcoal/10 flex items-center justify-center mb-4">
          <span className="page-title text-lg text-green-charcoal">
            {userName.charAt(0).toUpperCase()}
          </span>
        </div>
        <p className="text-sm font-medium text-text-dark">{userName}</p>
        <p className="text-xs text-text-muted mt-0.5 truncate">{userEmail}</p>
      </div>

      <ul className="space-y-1 flex-1">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-green-charcoal text-bg-off-white"
                    : "text-text-muted hover:text-text-dark hover:bg-bg-off-white/60"
                }`}
              >
                {item.icon}
                <span className="tracking-wide">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="pt-6 mt-6 border-t border-text-dark/10 space-y-3">
        <Link
          href="/shop"
          className="flex items-center gap-2 text-xs tracking-widest uppercase text-text-muted hover:text-text-dark transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Continue Shopping
        </Link>
        <LogoutButton className="text-xs tracking-widest uppercase text-text-muted hover:text-text-dark" />
      </div>
    </nav>
  );
}
