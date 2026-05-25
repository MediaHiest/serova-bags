import Link from "next/link";

interface AccountEmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function AccountEmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: AccountEmptyStateProps) {
  return (
    <div className="account-card p-12 text-center">
      <div className="w-14 h-14 rounded-full bg-bg-beige flex items-center justify-center mx-auto mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      </div>
      <h3 className="text-sm font-medium text-text-dark mb-2">{title}</h3>
      <p className="text-sm text-text-muted font-normal max-w-sm mx-auto mb-6">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn-primary inline-block text-xs py-2 px-6">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
