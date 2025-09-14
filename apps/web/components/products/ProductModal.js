"use client";
import { useState, useEffect } from "react";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";

export default function ProductModal({ isOpen, onClose, mode, product, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    slug: "",
    price: 0,
    category_id: "",
    hide_price: false,
    stock_quantity: 0,
    description: "",
    status: "active",
  });
  const [categories, setCategories] = useState([]);
  const { quill, quillRef } = useQuill();

  useEffect(() => {
    if (isOpen) {
      fetch("/api/categories?limit=100")
        .then((res) => res.json())
        .then((data) => setCategories(data?.data || []));
    }
  }, [isOpen]);

  // ✅ Sync content Quill → state
  useEffect(() => {
    if (quill) {
      quill.root.innerHTML = form.description || "";
      quill.on("text-change", () => {
        setForm((prev) => ({ ...prev, description: quill.root.innerHTML }));
      });
    }
  }, [quill]);

  useEffect(() => {
    if (mode === "edit" && product) {
      setForm({
        name: product.name,
        slug: product.slug,
        price: product.price,
        category_id: product.category_id,
        hide_price: product.hide_price,
        stock_quantity: product.stock_quantity,
        description: product.description || "",
        status: product.status,
      });
    } else if (mode === "create") {
      setForm({
        name: "",
        slug: "",
        price: 0,
        category_id: "",
        hide_price: false,
        stock_quantity: 0,
        description: "",
        status: "active",
      });
    }
  }, [mode, product]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = mode === "create" ? "/api/products" : `/api/products/${product.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      onSuccess();
      onClose();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">
          {mode === "create" ? "Create Product" : "Edit Product"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
            required
            className="w-full rounded border px-3 py-2"
          />
          <input
            name="slug"
            value={form.slug}
            onChange={handleChange}
            placeholder="Slug"
            required
            className="w-full rounded border px-3 py-2"
          />
          <input
            name="price"
            type="number"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2"
          />
          <select
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            name="stock_quantity"
            type="number"
            value={form.stock_quantity}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2"
          />

          {/* ✅ Rich Text Editor */}
          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <div ref={quillRef} className="h-40 rounded border" />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="hide_price"
              checked={form.hide_price}
              onChange={handleChange}
            />{" "}
            Hide Price
          </label>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded border px-4 py-2">
              Cancel
            </button>
            <button
              type="submit"
              className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              {mode === "create" ? "Create" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
