"use client";

import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import Pagination from "@/components/common/Pagination";
import TableSkeleton from "@/components/categories/TableSkeleton";
import CategoryRow from "@/components/categories/CategoryRow";
import CategoryModal from "@/components/categories/CategoryModal";

/* ============================================================
   MAIN PAGE: CATEGORY MANAGEMENT
   ============================================================ */
export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedCategory, setSelectedCategory] = useState(null);

  /* ------------------------------------------------------------
     Debounce Search
     ------------------------------------------------------------ */
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  /* ------------------------------------------------------------
     Fetch Categories from API
     ------------------------------------------------------------ */
  async function fetchCategories(newPage = 1, s = debouncedSearch) {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/categories/parents?page=${newPage}&limit=${limit}&search=${encodeURIComponent(s)}`
      );
      const data = await response.json();
      setCategories(data?.data || []);
      setPagination(data?.pagination || { total: 0, page: 1, limit, totalPages: 1 });
      setPage(data?.pagination?.page || newPage);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories(1, debouncedSearch);
  }, [debouncedSearch]);

  /* ------------------------------------------------------------
     Handlers: Move, Delete, Status Update
     ------------------------------------------------------------ */
  async function handleMove(id, direction) {
    const response = await fetch(`/api/categories/${id}/move`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    });
    if (response.ok) fetchCategories(page, debouncedSearch);
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this category?")) return;
    const response = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (response.ok) fetchCategories(page, debouncedSearch);
  }

  function handleStatusUpdate(id, newStatus) {
    setCategories((previous) =>
      previous.map((cat) =>
        cat.id === id
          ? { ...cat, status: newStatus }
          : {
              ...cat,
              children: cat.children.map((ch) =>
                ch.id === id ? { ...ch, status: newStatus } : ch
              ),
            }
      )
    );
  }

  /* ------------------------------------------------------------
     Render
     ------------------------------------------------------------ */
  return (
    <div className="w-full p-4 sm:p-6">
      <Breadcrumb
        items={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Categories" }]}
      />

      {/* Header Section */}
      <div className="admin-header mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-semibold">Categories Management</h1>
          <p className="text-secondary text-sm">Organize and manage product categories</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="focus:border-primary w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm shadow-sm focus:ring focus:ring-red-200 sm:w-64"
            />
          </div>

          <button
            onClick={() => {
              setModalMode("create");
              setSelectedCategory(null);
              setModalOpen(true);
            }}
            className="add-btn bg-primary flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-white shadow transition hover:bg-red-700"
          >
            <Plus className="h-4 w-4" /> Add Category
          </button>
        </div>
      </div>

      {/* Table Section */}
      {loading ? (
        <TableSkeleton />
      ) : categories.length === 0 ? (
        <p className="text-gray-500">No categories found.</p>
      ) : (
        <>
          <div className="table-container w-full">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Sort</th>
                  <th>Status</th>
                  <th>Products</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <CategoryRow
                    key={category.id}
                    category={category}
                    expanded={expanded}
                    toggleExpand={(id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))}
                    onStatusUpdate={handleStatusUpdate}
                    onMove={handleMove}
                    onEdit={(c) => {
                      setModalMode("edit");
                      setSelectedCategory(c);
                      setModalOpen(true);
                    }}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            pagination={pagination}
            page={pagination.page}
            onPageChange={(newPage) => {
              setPage(newPage);
              fetchCategories(newPage, debouncedSearch);
            }}
          />
        </>
      )}

      {/* Modal */}
      <CategoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        category={selectedCategory}
        onSuccess={() => fetchCategories(page, debouncedSearch)}
      />
    </div>
  );
}
