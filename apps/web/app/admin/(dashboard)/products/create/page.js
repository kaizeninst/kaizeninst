"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import Breadcrumb from "@/components/common/Breadcrumb";

export default function CreateProductPage() {
  const router = useRouter();
  const { quill, quillRef } = useQuill();

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

  useEffect(() => {
    fetch("/api/categories?limit=100")
      .then((res) => res.json())
      .then((data) => setCategories(data?.data || []));
  }, []);

  useEffect(() => {
    if (quill) {
      quill.on("text-change", () => {
        setForm((prev) => ({ ...prev, description: quill.root.innerHTML }));
      });
    }
  }, [quill]);

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
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      alert("Product created!");
      router.push("/admin/dashboard/products");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6">
      <Breadcrumb
        items={[{ label: "Products", href: "/admin/products" }, { label: "Create Product" }]}
      />

      <h1 className="mb-6 text-2xl font-semibold">Create Product</h1>

      {/* ✅ ฟอร์มชิดซ้ายและเต็มพื้นที่ */}
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Slug</label>
          <input
            name="slug"
            value={form.slug}
            onChange={handleChange}
            required
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Price (THB)</label>
          <input
            name="price"
            type="number"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Category</label>
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
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Stock Quantity</label>
          <input
            name="stock_quantity"
            type="number"
            value={form.stock_quantity}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <div ref={quillRef} className="h-40 overflow-y-auto rounded border" />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="hide_price"
            checked={form.hide_price}
            onChange={handleChange}
          />
          <label className="text-sm">Hide Price</label>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Status</label>
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

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => router.push("/admin/dashboard/products")}
            className="rounded border px-4 py-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
