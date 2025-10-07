"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import Image from "next/image";
import { Edit, ArrowLeft, Trash2 } from "lucide-react";

export default function ViewProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // ✅ ดึงข้อมูลสินค้า
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        alert("Failed to load product data");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // ✅ ลบสินค้า
  const handleDelete = async () => {
    if (!confirm("⚠️ Are you sure you want to delete this product?")) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Delete failed");
      alert("✅ Product deleted successfully!");
      router.push("/admin/products");
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!product) return <p className="p-6 text-gray-500">Product not found.</p>;

  const formatTHB = (n) =>
    Number(n || 0).toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[{ label: "Products", href: "/admin/products" }, { label: "View Product" }]}
      />

      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h1 className="text-foreground text-2xl font-semibold">{product.name}</h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => router.push(`/admin/products/${id}/edit`)}
            className="bg-primary flex items-center gap-2 rounded px-4 py-2 text-sm text-white shadow transition hover:bg-red-700"
          >
            <Edit className="h-4 w-4" /> Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-sm text-white shadow transition hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? "Deleting..." : "Delete"}
          </button>
          <button
            onClick={() => router.push("/admin/products")}
            className="flex items-center gap-2 rounded border px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>
      </div>

      {/* Product Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="w-full md:w-1/3">
            <div className="relative aspect-square overflow-hidden rounded-lg border bg-gray-50">
              <Image
                src={
                  product.image_path && product.image_path.trim() !== ""
                    ? product.image_path.startsWith("http")
                      ? product.image_path
                      : product.image_path.startsWith("/uploads")
                        ? product.image_path
                        : `/uploads/${product.image_path}`
                    : "/images/placeholder.png"
                }
                alt={product.name}
                fill
                sizes="(max-width:768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-1 space-y-5">
            <div>
              <p className="text-sm text-gray-500">Slug</p>
              <p className="font-medium text-gray-800">{product.slug}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p>{product.Category?.name || "-"}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Price</p>
              <p className="text-primary text-lg font-semibold">THB {formatTHB(product.price)}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Stock Quantity</p>
              <p>{product.stock_quantity}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span
                className={`rounded px-2 py-1 text-xs font-medium ${
                  product.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {product.status}
              </span>
            </div>

            <div>
              <p className="text-sm text-gray-500">Hide Price</p>
              <p>{product.hide_price ? "✅ Hidden" : "❌ Visible"}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-8">
          <p className="mb-2 text-sm text-gray-500">Description</p>
          <div
            className="prose max-w-none text-gray-700"
            dangerouslySetInnerHTML={{
              __html: product.description || "<em>No description provided.</em>",
            }}
          />
        </div>
      </div>
    </div>
  );
}
