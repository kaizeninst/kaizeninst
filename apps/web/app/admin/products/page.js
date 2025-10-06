"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Edit, Trash } from "lucide-react";

export default function ProductsPage() {
  const router = useRouter();

  // State for products and loading status
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Search states (with debounce)
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch product list
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

  // Load product list whenever search changes
  useEffect(() => {
    fetchProducts(1, debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Toggle show/hide price
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

  // Toggle product status (active/inactive)
  const handleToggleStatus = async (product) => {
    try {
      const res = await fetch(`/api/products/${product.id}/toggle`, {
        method: "PATCH",
      });
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

      if (res.ok) {
        fetchProducts(page, debouncedSearch);
      } else {
        alert(data.error || "Failed to delete");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Format number to THB currency
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
          {/* Search input */}
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

          {/* Go to create product page */}
          <Link
            href="/admin/products/create"
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white shadow hover:bg-red-700"
          >
            <Plus className="h-4 w-4" /> Add Product
          </Link>
        </div>
      </div>

      {/* Product table */}
      {loading ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full rounded-lg border border-gray-200 bg-white shadow-sm">
              <thead className="bg-gray-100 text-sm text-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left">Image</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-left">Price</th>
                  <th className="px-4 py-2 text-left">Show Price</th>
                  <th className="px-4 py-2 text-left">Stock</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Action</th>
                </tr>
              </thead>

              <tbody className="text-sm">
                {products.map((p) => {
                  const isOutOfStock = p.stock_quantity === 0 || p.status !== "active";
                  const imgSrc =
                    p.image_path && p.image_path.trim() !== ""
                      ? p.image_path
                      : "/images/placeholder.png";

                  return (
                    <tr key={p.id} className="border-t hover:bg-gray-50">
                      {/* Image */}
                      <td className="px-4 py-2">
                        <img
                          src={imgSrc}
                          alt={p.name}
                          className="h-10 w-10 rounded border object-cover"
                          loading="lazy"
                        />
                      </td>

                      {/* Name */}
                      <td className="px-4 py-2 font-medium">{p.name}</td>

                      {/* Category */}
                      <td className="px-4 py-2 text-gray-600">{p.Category?.name || "-"}</td>

                      {/* Price */}
                      <td className="px-4 py-2 font-semibold text-red-600">
                        THB {formatTHB(p.price)}
                      </td>

                      {/* Toggle show/hide price */}
                      <td className="px-4 py-2 text-left">
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

                      {/* Stock quantity */}
                      <td className="px-4 py-2">{p.stock_quantity}</td>

                      {/* Toggle active/inactive status */}
                      <td className="px-4 py-2 text-left">
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

                      {/* Actions: edit / delete */}
                      <td className="px-4 py-2">
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

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => fetchProducts(p, debouncedSearch)}
                  className={`rounded border px-3 py-1 ${
                    page === p ? "bg-red-600 text-white" : "bg-white hover:bg-gray-50"
                  }`}
                >
                  {p}
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
