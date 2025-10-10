"use client";

import { useState, useEffect } from "react";

/* ============================================================
   CATEGORY MODAL (CREATE / EDIT)
   ============================================================ */
export default function CategoryModal({ isOpen, onClose, mode, category, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    parent_id: null,
    sort_order: 0,
    status: "active",
  });

  const [parentCategories, setParentCategories] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/categories?limit=100")
        .then((res) => res.json())
        .then((data) => setParentCategories(data?.data || []))
        .catch((err) => console.error("Error fetching parent categories:", err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (mode === "edit" && category) {
      setFormData({
        name: category.name || "",
        slug: category.slug || "",
        parent_id: category.parent_id ?? null,
        sort_order: category.sort_order || 0,
        status: category.status || "active",
      });
    } else if (mode === "create") {
      setFormData({
        name: "",
        slug: "",
        parent_id: null,
        sort_order: 0,
        status: "active",
      });
    }
  }, [mode, category]);

  if (!isOpen) return null;

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({
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
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const url = mode === "create" ? "/api/categories" : `/api/categories/${category.id}`;
    const method = mode === "create" ? "POST" : "PUT";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    if (response.ok) {
      onSuccess();
      onClose();
    } else {
      alert(data.error || "Failed to save category");
    }
  }

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
              value={formData.name}
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
              value={formData.slug}
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
              value={formData.parent_id ?? ""}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2"
            >
              <option value="">— None (Top-level) —</option>
              {parentCategories.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.name}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
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
