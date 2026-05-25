"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/users", label: "Users" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <aside className="admin-sidebar w-56 min-h-screen p-6 flex flex-col">
      <Link href="/admin" className="page-title text-xl mb-8 text-bg-off-white">
        Selora Admin
      </Link>
      <nav className="flex-1 space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-3 py-2 rounded text-sm ${
              pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href))
                ? "bg-white/10 text-white"
                : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="space-y-2 pt-4 border-t border-white/10">
        <Link href="/" className="block text-xs text-white/60 hover:text-white">
          View Store
        </Link>
        <button onClick={handleLogout} className="text-xs text-white/60 hover:text-white">
          Logout
        </button>
      </div>
    </aside>
  );
}
