"use client";

export default function Pagination({ pagination, page, onPageChange }) {
  if (!pagination) return null;

  return (
    <div className="mt-4 flex items-center justify-between">
      <p className="text-sm text-gray-600">
        Showing {(pagination.page - 1) * pagination.limit + 1}–
        {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
      </p>

      <div className="flex gap-2">
        {/* Previous */}
        <button
          disabled={pagination.page === 1}
          onClick={() => onPageChange(pagination.page - 1)}
          className={`rounded border px-3 py-1 ${
            pagination.page === 1
              ? "cursor-not-allowed bg-gray-100 text-gray-400"
              : "bg-red-500 text-white hover:bg-red-600"
          }`}
        >
          Previous
        </button>

        {/* Numbered pages */}
        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`rounded border px-3 py-1 ${
              page === p ? "bg-red-600 text-white" : "bg-white hover:bg-gray-50"
            }`}
          >
            {p}
          </button>
        ))}

        {/* Next */}
        <button
          disabled={pagination.page === pagination.totalPages}
          onClick={() => onPageChange(pagination.page + 1)}
          className={`rounded border px-3 py-1 ${
            pagination.page === pagination.totalPages
              ? "cursor-not-allowed bg-gray-100 text-gray-400"
              : "bg-red-500 text-white hover:bg-red-600"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
