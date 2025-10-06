"use client";

export default function Pagination({ pagination, page, onPageChange }) {
  if (!pagination) return null;

  const { total, totalPages, limit } = pagination;
  const start = (pagination.page - 1) * limit + 1;
  const end = Math.min(pagination.page * limit, total);

  // เพื่อไม่ให้โชว์ปุ่มเยอะเกินในกรณีมีหลายหน้า
  const visiblePages = [];
  const maxVisible = 5;
  let startPage = Math.max(1, page - 2);
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    visiblePages.push(i);
  }

  return (
    <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
      {/* Info text */}
      <p className="text-sm text-gray-600">
        Showing {start}–{end} of {total}
      </p>

      {/* Pagination Controls */}
      <div className="flex flex-wrap justify-center gap-2">
        {/* Previous */}
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className={`rounded-md border px-3 py-1.5 text-sm font-medium transition ${
            page === 1
              ? "cursor-not-allowed bg-gray-100 text-gray-400"
              : "border-primary text-primary hover:bg-primary hover:text-white"
          }`}
        >
          Previous
        </button>

        {/* First Page */}
        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className={`rounded-md border px-3 py-1.5 text-sm font-medium ${
                page === 1
                  ? "bg-primary text-white"
                  : "border-primary text-primary hover:bg-primary hover:text-white"
              }`}
            >
              1
            </button>
            {startPage > 2 && <span className="px-1 text-gray-400">…</span>}
          </>
        )}

        {/* Page Numbers */}
        {visiblePages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`rounded-md border px-3 py-1.5 text-sm font-medium transition ${
              p === page
                ? "bg-primary border-primary text-white"
                : "hover:border-primary hover:text-primary border-gray-300 text-gray-700"
            }`}
          >
            {p}
          </button>
        ))}

        {/* Last Page */}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-1 text-gray-400">…</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className={`rounded-md border px-3 py-1.5 text-sm font-medium ${
                page === totalPages
                  ? "bg-primary border-primary text-white"
                  : "border-primary text-primary hover:bg-primary hover:text-white"
              }`}
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next */}
        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className={`rounded-md border px-3 py-1.5 text-sm font-medium transition ${
            page === totalPages
              ? "cursor-not-allowed bg-gray-100 text-gray-400"
              : "border-primary text-primary hover:bg-primary hover:text-white"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
