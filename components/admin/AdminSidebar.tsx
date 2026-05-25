"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandLogo from "@/components/store/BrandLogo";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/brands", label: "Brands" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/users", label: "Users" },
];

interface AdminSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ open = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  function handleNavClick() {
    onClose?.();
  }

  return (
    <aside
      className={`admin-sidebar fixed inset-y-0 left-0 z-50 w-56 p-5 sm:p-6 flex flex-col transform transition-transform duration-200 ease-out lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      } lg:fixed lg:inset-y-0 lg:left-0`}
    >
      <Link href="/admin" className="block mb-8" onClick={handleNavClick}>
        <BrandLogo
          variant="navbar"
          className="logo-blend-screen"
          imageClassName="h-8 w-auto max-w-[150px]"
        />
      </Link>
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            (link.href !== "/admin" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={handleNavClick}
              className={`block px-3 py-2.5 rounded text-sm ${
                active
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-2 pt-4 border-t border-white/10 shrink-0">
        <Link
          href="/"
          className="block text-xs text-white/60 hover:text-white"
          onClick={handleNavClick}
        >
          View Store
        </Link>
        <button onClick={handleLogout} className="text-xs text-white/60 hover:text-white">
          Logout
        </button>
      </div>
    </aside>
  );
}
