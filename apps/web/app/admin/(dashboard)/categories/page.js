"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash } from "lucide-react";

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

  async function fetchCategories(p = page) {
    setLoading(true);
    try {
      const res = await fetch(`/api/categories?page=${p}&limit=${limit}`);
      const data = await res.json();

      setCategories(data?.data || []);
      setPagination(data?.pagination || { total: 0, page: 1, limit, totalPages: 1 });
      setPage(data?.pagination?.page || p);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories(1);
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Add Category
        </button>
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
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Slug</th>
                  <th className="px-4 py-2 text-left">Parent</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {categories.map((cat) => (
                  <tr key={cat.id} className="border-t">
                    <td className="px-4 py-2">{cat.id}</td>
                    <td className="px-4 py-2">{cat.name}</td>
                    <td className="px-4 py-2 text-gray-600">{cat.slug}</td>
                    <td className="px-4 py-2 text-gray-600">
                      {cat.parent_id ? `Parent #${cat.parent_id}` : "-"}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          cat.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {cat.status}
                      </span>
                    </td>
                    <td className="flex gap-2 px-4 py-2">
                      <button className="rounded bg-gray-100 p-2 hover:bg-gray-200">
                        <Edit className="h-4 w-4 text-blue-600" />
                      </button>
                      <button className="rounded bg-gray-100 p-2 hover:bg-gray-200">
                        <Trash className="h-4 w-4 text-red-600" />
                      </button>
                    </td>
                  </tr>
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
                onClick={() => fetchCategories(page - 1)}
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
                  onClick={() => fetchCategories(p)}
                  className={`rounded border px-3 py-1 ${
                    page === p ? "bg-blue-600 text-white" : "bg-white hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                disabled={pagination.page === pagination.totalPages}
                onClick={() => fetchCategories(page + 1)}
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
