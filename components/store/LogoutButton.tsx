"use client";

interface LogoutButtonProps {
  className?: string;
  label?: string;
  onLoggedOut?: () => void;
}

export default function LogoutButton({
  className = "text-sm text-text-muted hover:text-text-dark underline",
  label = "Sign Out",
  onLoggedOut,
}: LogoutButtonProps) {
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    onLoggedOut?.();
    window.location.href = "/";
  }

  return (
    <button type="button" onClick={handleLogout} className={className}>
      {label}
    </button>
  );
}
