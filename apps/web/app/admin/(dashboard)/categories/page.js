"use client";

import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { CategoryRow } from "../../../../components/categories";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [expanded, setExpanded] = useState({});
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // ✅ ทำ debounce (รอ 300ms ก่อนอัปเดตค่า debouncedSearch)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const handleStatusUpdate = (id, newStatus) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id
          ? { ...cat, status: newStatus }
          : {
              ...cat,
              children: cat.children.map((child) =>
                child.id === id ? { ...child, status: newStatus } : child
              ),
            }
      )
    );
  };

  const handleMove = async (id, direction) => {
    try {
      const res = await fetch(`/api/categories/${id}/move`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchCategories(page, debouncedSearch); // รีโหลดใหม่
      } else {
        alert(data.error || "Failed to move");
      }
    } catch (err) {
      console.error("Move error:", err);
    }
  };

  async function fetchCategories(p = page, s = debouncedSearch) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/categories?page=${p}&limit=${limit}&search=${encodeURIComponent(s)}`
      );
      const data = await res.json();

      const parents = (data?.data || []).filter((cat) => !cat.parent_id);
      setCategories(parents);
      setPagination(data?.pagination || { total: 0, page: 1, limit, totalPages: 1 });
      setPage(data?.pagination?.page || p);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories(1, debouncedSearch);
  }, [debouncedSearch]);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* 🔎 Search Section */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 sm:w-64"
            />
          </div>

          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700">
            <Plus className="h-4 w-4" /> Add Category
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : categories.length === 0 ? (
        <p className="text-gray-500">No categories found.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full rounded-lg border border-gray-200 bg-white shadow-sm">
              <thead className="bg-gray-100 text-sm text-gray-700">
                <tr>
                  <th className="w-4/12 px-4 py-2 text-left">Name</th>
                  <th className="w-2/12 px-4 py-2 text-left">Slug</th>
                  <th className="w-1/12 px-4 py-2 text-left">Sort</th>
                  <th className="w-1/12 px-4 py-2 text-left">Status</th>
                  <th className="w-1/12 px-4 py-2 text-left">Products</th>
                  <th className="w-2/12 px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {categories.map((cat) => (
                  <CategoryRow
                    key={cat.id}
                    category={cat}
                    expanded={expanded}
                    toggleExpand={toggleExpand}
                    onStatusUpdate={handleStatusUpdate}
                    onMove={handleMove}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>

            <div className="flex gap-2">
              <button
                disabled={pagination.page === 1}
                onClick={() => fetchCategories(page - 1, debouncedSearch)}
                className={`rounded border px-3 py-1 ${
                  pagination.page === 1
                    ? "cursor-not-allowed bg-gray-100 text-gray-400"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                Previous
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => fetchCategories(p, debouncedSearch)}
                  className={`rounded border px-3 py-1 ${
                    page === p ? "bg-blue-600 text-white" : "bg-white hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                disabled={pagination.page === pagination.totalPages}
                onClick={() => fetchCategories(page + 1, debouncedSearch)}
                className={`rounded border px-3 py-1 ${
                  pagination.page === pagination.totalPages
                    ? "cursor-not-allowed bg-gray-100 text-gray-400"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
