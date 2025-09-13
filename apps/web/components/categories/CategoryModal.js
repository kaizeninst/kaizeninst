"use client";
import { useState, useEffect } from "react";

export default function CategoryModal({ isOpen, onClose, mode, category, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    slug: "",
    parent_id: null,
    sort_order: 0,
    status: "active",
  });

  const [parents, setParents] = useState([]);

  // โหลดรายชื่อ parent categories
  useEffect(() => {
    if (isOpen) {
      fetch("/api/categories?limit=100")
        .then((res) => res.json())
        .then((data) => {
          setParents(data?.data || []);
        })
        .catch((err) => console.error("Error fetching parents:", err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (mode === "edit" && category) {
      setForm({
        name: category.name || "",
        slug: category.slug || "",
        parent_id: category.parent_id || null,
        sort_order: category.sort_order || 0,
        status: category.status || "active",
      });
    } else {
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
      [name]: name === "parent_id" ? (value === "" ? null : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = mode === "create" ? "/api/categories" : `/api/categories/${category.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      onSuccess(); // reload categories
      onClose();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">
          {mode === "create" ? "Create Category" : "Edit Category"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
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

          {/* Slug */}
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

          {/* Parent Category */}
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

          {/* Sort Order */}
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

          {/* Status */}
          <div>
            <label className="block text-sm font-medium">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded border px-4 py-2">
              Cancel
            </button>
            <button
              type="submit"
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              {mode === "create" ? "Create" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
