"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import Breadcrumb from "@/components/common/Breadcrumb";
import { UploadCloud, ImagePlus, X } from "lucide-react";

export default function CreateProductPage() {
  const router = useRouter();
  const { quill, quillRef } = useQuill();

  // Form state
  const [form, setForm] = useState({
    name: "",
    slug: "",
    price: 0,
    category_id: "",
    hide_price: false,
    stock_quantity: 0,
    description: "",
    status: "active",
    image_path: "",
  });

  const [categories, setCategories] = useState([]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Fetch categories
  useEffect(() => {
    fetch("/api/categories?limit=100")
      .then((res) => res.json())
      .then((data) => setCategories(data?.data || []));
  }, []);

  // Sync description from Quill editor
  useEffect(() => {
    if (quill) {
      quill.on("text-change", () => {
        setForm((prev) => ({ ...prev, description: quill.root.innerHTML }));
      });
    }
  }, [quill]);

  // Handle form change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      alert("File too large (max 5MB)");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  // Upload file to backend
  const handleUpload = async () => {
    if (!file) return "";
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/products/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      return data.url;
    } catch (err) {
      alert(err.message);
      return "";
    } finally {
      setUploading(false);
    }
  };

  // Submit new product
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = form.image_path;

      // Upload image if selected
      if (file) {
        const uploaded = await handleUpload();
        if (uploaded) imageUrl = uploaded;
      }

      const payload = { ...form, image_path: imageUrl };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      alert("✅ Product created successfully!");
      router.push("/admin/products");
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

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* ---------- Basic Info Section ---------- */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Product Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full rounded border px-3 py-2 focus:border-red-500 focus:ring focus:ring-red-200"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Slug</label>
              <input
                name="slug"
                value={form.slug}
                onChange={handleChange}
                required
                className="w-full rounded border px-3 py-2 focus:border-red-500 focus:ring focus:ring-red-200"
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
                className="w-full rounded border px-3 py-2 focus:border-red-500 focus:ring focus:ring-red-200"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Stock Quantity</label>
              <input
                name="stock_quantity"
                type="number"
                value={form.stock_quantity}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2 focus:border-red-500 focus:ring focus:ring-red-200"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Category</label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2 focus:border-red-500 focus:ring focus:ring-red-200"
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
              <label className="mb-1 block text-sm font-medium">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2 focus:border-red-500 focus:ring focus:ring-red-200"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* ---------- Description Section ---------- */}
          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <div
              ref={quillRef}
              className="h-48 overflow-y-auto rounded border focus:border-red-500 focus:ring focus:ring-red-200"
            />
          </div>

          {/* ---------- Image Upload Section ---------- */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Product Image</label>

            <div
              className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition hover:border-red-400 ${
                preview ? "border-gray-300 bg-gray-50" : "border-gray-300"
              }`}
              onClick={() => document.getElementById("image-upload").click()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) {
                  setFile(f);
                  setPreview(URL.createObjectURL(f));
                }
              }}
              onDragOver={(e) => e.preventDefault()}
            >
              {/* Preview Image */}
              {preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-40 w-40 rounded-lg object-cover shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreview(null);
                      setFile(null);
                    }}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2 text-gray-500">
                  <UploadCloud className="h-10 w-10 text-gray-400" />
                  <p className="text-sm">Click or drag an image here to upload</p>
                  <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                  <button
                    type="button"
                    className="mt-3 flex items-center gap-2 rounded bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
                  >
                    <ImagePlus className="h-4 w-4" />
                    Choose Image
                  </button>
                </div>
              )}
            </div>

            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* ---------- Misc Options ---------- */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="hide_price"
              checked={form.hide_price}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <label className="text-sm">Hide Price</label>
          </div>

          {/* ---------- Buttons ---------- */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="rounded border border-gray-300 px-5 py-2 text-gray-700 hover:bg-gray-100"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="rounded bg-red-600 px-5 py-2 text-white hover:bg-red-700"
            >
              {uploading ? "Uploading..." : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
