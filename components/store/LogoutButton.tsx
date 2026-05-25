"use client";

interface LogoutButtonProps {
  className?: string;
}

export default function LogoutButton({
  className = "text-sm text-text-muted hover:text-text-dark underline",
}: LogoutButtonProps) {
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <button type="button" onClick={handleLogout} className={className}>
      Sign Out
    </button>
  );
}
