"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AccountNav from "./AccountNav";

interface AccountShellProps {
  userName: string;
  userEmail: string;
  children: React.ReactNode;
}

export default function AccountShell({ userName, userEmail, children }: AccountShellProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-16">
      <div className="text-center mb-6 sm:mb-8 md:mb-12">
        <h1 className="page-title text-2xl sm:text-3xl md:text-4xl text-text-dark">My Account</h1>
        <div className="title-underline" />
      </div>

      <button
        type="button"
        className="lg:hidden flex items-center gap-2 text-sm text-text-muted mb-5 sm:mb-6 px-4 py-2.5 bg-bg-off-white/60 rounded-lg w-full sm:w-auto"
        onClick={() => setMobileNavOpen(!mobileNavOpen)}
        aria-expanded={mobileNavOpen}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
        Account Menu
      </button>

      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-12">
        <aside
          className={`lg:w-64 shrink-0 ${mobileNavOpen ? "block" : "hidden lg:block"}`}
        >
          <div className="account-card lg:sticky lg:top-28 p-4 sm:p-6">
            <AccountNav userName={userName} userEmail={userEmail} />
          </div>
        </aside>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
