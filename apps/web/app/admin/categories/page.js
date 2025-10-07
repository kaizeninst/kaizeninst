"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash,
  ChevronRight,
  ChevronDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import Pagination from "@/components/common/Pagination";

/* ---------------------- Skeleton Loader ---------------------- */
function TableSkeleton() {
  return (
    <div className="table-container w-full animate-pulse">
      <table className="table">
        <thead>
          <tr>
            {Array.from({ length: 6 }).map((_, i) => (
              <th key={i}>
                <div className="h-4 w-16 rounded bg-gray-200"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 10 }).map((_, i) => (
            <tr key={i}>
              {Array.from({ length: 6 }).map((_, j) => (
                <td key={j}>
                  <div className="h-5 w-full rounded bg-gray-100"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------------- Status Toggle ---------------------- */
function StatusToggle({ category, onStatusChange }) {
  const handleToggle = async () => {
    try {
      const res = await fetch(`/api/categories/${category.id}/toggle`, { method: "PATCH" });
      const data = await res.json();
      if (res.ok) onStatusChange?.(data.status);
      else alert(data.error || "Failed to update");
    } catch (err) {
      console.error("Toggle status error:", err);
    }
  };
  const isActive = category.status === "active";
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
          isActive ? "bg-primary" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
            isActive ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      <span
        className={`rounded-full px-3 py-1 text-xs font-medium ${
          isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    </div>
  );
}

/* ---------------------- Category Row ---------------------- */
function CategoryRow({
  category,
  depth = 0,
  expanded,
  toggleExpand,
  onStatusUpdate,
  onMove,
  onEdit,
  onDelete,
}) {
  const hasChildren = category.children && category.children.length > 0;
  const productCount = category.productsCount ?? 0;

  return (
    <>
      <tr className={depth === 0 ? "border-t bg-gray-50" : "border-t"}>
        <td className="px-4 py-2">
          <div className="flex items-center gap-2" style={{ paddingLeft: depth * 20 }}>
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

        <td className="px-4 py-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onMove?.(category.id, "up")}
              className="rounded p-1 hover:bg-gray-100"
              title="Move Up"
            >
              <ArrowUp className="h-4 w-4 text-gray-500" />
            </button>
            <span className="font-medium">{category.sort_order ?? "-"}</span>
            <button
              onClick={() => onMove?.(category.id, "down")}
              className="rounded p-1 hover:bg-gray-100"
              title="Move Down"
            >
              <ArrowDown className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </td>

        <td className="px-4 py-2">
          <StatusToggle
            category={category}
            onStatusChange={(newStatus) => onStatusUpdate?.(category.id, newStatus)}
          />
        </td>

        <td className="px-4 py-2 text-center">{productCount}</td>

        <td className="flex gap-2 px-4 py-2">
          <button
            onClick={() => onEdit?.(category)}
            className="rounded bg-gray-100 p-2 hover:bg-gray-200"
          >
            <Edit className="h-4 w-4 text-blue-600" />
          </button>
          <button
            onClick={() => onDelete?.(category.id)}
            className="rounded bg-gray-100 p-2 hover:bg-gray-200"
          >
            <Trash className="h-4 w-4 text-red-600" />
          </button>
        </td>
      </tr>

      {hasChildren &&
        expanded[category.id] &&
        category.children.map((child) => (
          <CategoryRow
            key={child.id}
            category={child}
            depth={depth + 1}
            expanded={expanded}
            toggleExpand={toggleExpand}
            onStatusUpdate={onStatusUpdate}
            onMove={onMove}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
    </>
  );
}

/* ---------------------- Category Modal ---------------------- */
function CategoryModal({ isOpen, onClose, mode, category, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    slug: "",
    parent_id: null,
    sort_order: 0,
    status: "active",
  });
  const [parents, setParents] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/categories?limit=100")
        .then((res) => res.json())
        .then((data) => setParents(data?.data || []))
        .catch((err) => console.error("Error fetching parents:", err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (mode === "edit" && category) {
      setForm({
        name: category.name || "",
        slug: category.slug || "",
        parent_id: category.parent_id ?? null,
        sort_order: category.sort_order || 0,
        status: category.status || "active",
      });
    } else if (mode === "create") {
      setForm({
        name: "",
        slug: "",
        parent_id: null,
        sort_order: 0,
        status: "active",
      });
    }
  }, [mode, category]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "parent_id"
          ? value === ""
            ? null
            : Number(value)
          : name === "sort_order"
            ? Number(value)
            : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = mode === "create" ? "/api/categories" : `/api/categories/${category.id}`;
    const method = mode === "create" ? "POST" : "PUT";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      onSuccess();
      onClose();
    } else alert(data.error || "Failed to save");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">
          {mode === "create" ? "Create Category" : "Edit Category"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Slug</label>
            <input
              type="text"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Parent Category</label>
            <select
              name="parent_id"
              value={form.parent_id ?? ""}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2"
            >
              <option value="">— None (Top-level) —</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Sort Order</label>
            <input
              type="number"
              name="sort_order"
              value={form.sort_order}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded border px-4 py-2">
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary rounded px-4 py-2 text-white hover:bg-red-700"
            >
              {mode === "create" ? "Create" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------------------- Main Page ---------------------- */
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

  // debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  // fetch data
  const fetchCategories = async (newPage = 1, s = debouncedSearch) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/categories/parents?page=${newPage}&limit=${limit}&search=${encodeURIComponent(s)}`
      );
      const data = await res.json();
      setCategories(data?.data || []);
      setPagination(data?.pagination || { total: 0, page: 1, limit, totalPages: 1 });
      setPage(data?.pagination?.page || newPage);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(1, debouncedSearch);
  }, [debouncedSearch]);

  const handleMove = async (id, direction) => {
    const res = await fetch(`/api/categories/${id}/move`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    });
    if (res.ok) fetchCategories(page, debouncedSearch);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) fetchCategories(page, debouncedSearch);
  };

  const handleStatusUpdate = (id, newStatus) => {
    setCategories((prev) =>
      prev.map((cat) =>
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
  };

  return (
    <div className="w-full p-4 sm:p-6">
      <Breadcrumb
        items={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Categories" }]}
      />
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
                {categories.map((cat) => (
                  <CategoryRow
                    key={cat.id}
                    category={cat}
                    expanded={expanded}
                    toggleExpand={(id) => setExpanded((p) => ({ ...p, [id]: !p[id] }))}
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
