import { useMemo } from "react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }

    if (currentPage > totalPages - 4) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  }, [currentPage, totalPages]);

  return (
    <div className="mt-6 flex justify-between items-center text-sm text-[var(--color-fg)]">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded border border-[var(--color-border)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        Previous
      </button>

      <div className="flex gap-2 items-center">
        {pageNumbers.map((page, index) =>
          typeof page === "number" ? (
            <button
              key={index}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 rounded border ${
                currentPage === page
                  ? "bg-[var(--color-fg)] text-[var(--color-bg)] border-[var(--color-fg)]"
                  : "border-[var(--color-border)] hover:bg-zinc-800"
              }`}
            >
              {page}
            </button>
          ) : (
            <span key={index} className="px-3 py-1">
              ...
            </span>
          )
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded border border-[var(--color-border)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}