"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Edit, Trash } from "lucide-react";
import Image from "next/image";

export default function ProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch products
  const fetchProducts = async (p = page, s = debouncedSearch) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/products?page=${p}&limit=${limit}&search=${encodeURIComponent(s)}`
      );
      const data = await res.json();
      setProducts(data?.data || []);
      setPagination(data?.pagination || { total: 0, page: 1, limit, totalPages: 1 });
      setPage(data?.pagination?.page || p);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1, debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Toggle hide_price
  const handleToggleShowPrice = async (product) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hide_price: !product.hide_price }),
      });
      const data = await res.json();
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, hide_price: data.hide_price } : p))
        );
      }
    } catch (err) {
      console.error("Toggle show price error:", err);
    }
  };

  // Toggle status
  const handleToggleStatus = async (product) => {
    try {
      const res = await fetch(`/api/products/${product.id}/toggle`, { method: "PATCH" });
      const data = await res.json();
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, status: data.status } : p))
        );
      } else {
        alert(data.error || "Failed to toggle status");
      }
    } catch (err) {
      console.error("Toggle status error:", err);
    }
  };

  // Delete product
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) fetchProducts(page, debouncedSearch);
      else alert(data.error || "Failed to delete");
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Format THB
  const formatTHB = (n) =>
    Number(n || 0).toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Products Management</h1>
          <p className="text-gray-400">Manage your store’s products</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm shadow-sm focus:border-red-500 focus:ring focus:ring-red-200 sm:w-64"
            />
          </div>

          {/* Add Product */}
          <Link
            href="/admin/products/create"
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white shadow hover:bg-red-700"
          >
            <Plus className="h-4 w-4" /> Add Product
          </Link>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Show Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {products.map((p) => {
                  const imgSrc =
                    p.image_path && p.image_path.trim() !== ""
                      ? p.image_path.startsWith("http")
                        ? p.image_path // external / GCS
                        : p.image_path.startsWith("/uploads")
                          ? p.image_path // local served by Express
                          : `/uploads/${p.image_path}` // fallback
                      : "/images/placeholder.png"; // no image

                  return (
                    <tr key={p.id}>
                      {/* Product Image */}
                      <td className="table-cell">
                        <div className="relative h-10 w-10 overflow-hidden rounded border bg-gray-100">
                          <Image
                            src={
                              p.image_path && p.image_path.trim() !== ""
                                ? p.image_path.startsWith("http")
                                  ? p.image_path // External (GCS or CDN)
                                  : p.image_path.startsWith("/uploads")
                                    ? p.image_path // Local (served by Express)
                                    : `/uploads/${p.image_path}` // Fallback
                                : "/images/placeholder.png" // No image
                            }
                            alt={p.name || "Product image"}
                            fill
                            sizes="40px"
                            className="object-cover"
                            unoptimized // ให้โหลดได้แม้เป็น external URL
                            onError={(e) => {
                              e.target.src = "/images/placeholder.png";
                            }}
                          />
                        </div>
                      </td>

                      <td className="table-cell font-medium">{p.name}</td>
                      <td className="table-cell text-gray-600">{p.Category?.name || "-"}</td>

                      <td className="table-cell font-semibold text-red-600">
                        THB {formatTHB(p.price)}
                      </td>

                      {/* Toggle Show Price */}
                      <td className="table-toggle">
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={!p.hide_price}
                            onChange={() => handleToggleShowPrice(p)}
                          />
                          <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-red-600 peer-checked:after:translate-x-full"></div>
                        </label>
                      </td>

                      <td className="table-cell">{p.stock_quantity}</td>

                      {/* Toggle Active / Inactive */}
                      <td className="table-toggle">
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={p.status === "active"}
                            onChange={() => handleToggleStatus(p)}
                          />
                          <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-red-600 peer-checked:after:translate-x-full"></div>
                        </label>
                      </td>

                      {/* Actions */}
                      <td className="table-actions">
                        <div className="flex gap-2">
                          <button
                            onClick={() => router.push(`/admin/products/${p.id}/edit`)}
                            className="rounded bg-gray-100 p-2 hover:bg-gray-200"
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="rounded bg-gray-100 p-2 hover:bg-gray-200"
                          >
                            <Trash className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
                onClick={() => fetchProducts(page - 1, debouncedSearch)}
                className={`rounded border px-3 py-1 ${
                  pagination.page === 1
                    ? "cursor-not-allowed bg-gray-100 text-gray-400"
                    : "bg-red-500 text-white hover:bg-red-600"
                }`}
              >
                Previous
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pnum) => (
                <button
                  key={pnum}
                  onClick={() => fetchProducts(pnum, debouncedSearch)}
                  className={`rounded border px-3 py-1 ${
                    page === pnum ? "bg-red-600 text-white" : "bg-white hover:bg-gray-50"
                  }`}
                >
                  {pnum}
                </button>
              ))}

              <button
                disabled={pagination.page === pagination.totalPages}
                onClick={() => fetchProducts(page + 1, debouncedSearch)}
                className={`rounded border px-3 py-1 ${
                  pagination.page === pagination.totalPages
                    ? "cursor-not-allowed bg-gray-100 text-gray-400"
                    : "bg-red-500 text-white hover:bg-red-600"
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
