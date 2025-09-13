"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash, ChevronRight, ChevronDown } from "lucide-react";

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

  async function fetchCategories(p = page) {
    setLoading(true);
    try {
      const res = await fetch(`/api/categories?page=${p}&limit=${limit}`);
      const data = await res.json();

      // ✅ กรองเฉพาะ parent เท่านั้น
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
    fetchCategories(1);
  }, []);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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
                  {/* ❌ เอา ID ออก */}
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

/** ✅ Category Row (show parent + children only) */
function CategoryRow({ category, expanded, toggleExpand }) {
  const hasChildren = category.children && category.children.length > 0;
  const productCount = category.Products ? category.Products.length : 0;

  return (
    <>
      {/* Parent row */}
      <tr className="border-t bg-gray-50">
        <td className="px-4 py-2">
          <div className="flex items-center gap-2">
            {hasChildren && (
              <button
                onClick={() => toggleExpand(category.id)}
                className="rounded p-1 hover:bg-gray-100"
              >
                {expanded[category.id] ? (
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                )}
              </button>
            )}
            <span className="font-medium">{category.name}</span>
          </div>
        </td>
        <td className="px-4 py-2 text-gray-600">{category.slug}</td>
        <td className="px-4 py-2">{category.sort_order}</td>
        <td className="px-4 py-2">
          <span
            className={`rounded px-2 py-1 text-xs font-medium ${
              category.status === "active"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {category.status}
          </span>
        </td>
        <td className="px-4 py-2">{productCount}</td>
        <td className="flex gap-2 px-4 py-2">
          <button className="rounded bg-gray-100 p-2 hover:bg-gray-200">
            <Edit className="h-4 w-4 text-blue-600" />
          </button>
          <button className="rounded bg-gray-100 p-2 hover:bg-gray-200">
            <Trash className="h-4 w-4 text-red-600" />
          </button>
        </td>
      </tr>

      {/* Children rows (inline, ไม่แสดง ID) */}
      {hasChildren &&
        expanded[category.id] &&
        category.children.map((child) => (
          <tr key={child.id} className="border-t">
            <td className="px-4 py-2 pl-10">— {child.name}</td>
            <td className="px-4 py-2 text-gray-600">{child.slug}</td>
            <td className="px-4 py-2">{child.sort_order ?? "-"}</td>
            <td className="px-4 py-2">
              <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">child</span>
            </td>
            <td className="px-4 py-2">0</td>
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
    </>
  );
}
