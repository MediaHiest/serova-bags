"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-10 sm:mt-12 mb-6 sm:mb-8 px-2">
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="text-xs sm:text-sm px-2 py-1 text-text-muted hover:text-text-dark disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        ← Prev
      </button>
      {pages.map((page, idx) =>
        page === "..." ? (
          <span key={`ellipsis-${idx}`} className="text-text-muted text-sm px-1">
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`text-xs sm:text-sm min-w-8 h-8 flex items-center justify-center transition-colors ${
              page === currentPage
                ? "text-text-dark font-medium border-b border-text-dark"
                : "text-text-muted hover:text-text-dark"
            }`}
          >
            {page}
          </button>
        )
      )}
      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="text-xs sm:text-sm px-2 py-1 text-text-muted hover:text-text-dark disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        Next →
      </button>
    </nav>
  );
}
