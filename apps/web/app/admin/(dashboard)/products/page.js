"use client";

import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { ProductRow, ProductModal } from "../../../../components/products";

export default function ProductsPage() {
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

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedProduct, setSelectedProduct] = useState(null);

  // debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  const handleStatusUpdate = (id, newStatus) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p)));
  };

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

  async function fetchProducts(p = page, s = debouncedSearch) {
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
  }

  useEffect(() => {
    fetchProducts(1, debouncedSearch);
  }, [debouncedSearch]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 sm:w-64"
            />
          </div>

          <button
            onClick={() => {
              setModalMode("create");
              setSelectedProduct(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Table */}
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
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Slug</th>
                  <th className="px-4 py-2 text-left">Price</th>
                  <th className="px-4 py-2 text-left">Stock</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {products.map((p) => (
                  <ProductRow
                    key={p.id}
                    product={p}
                    onStatusUpdate={handleStatusUpdate}
                    onEdit={(prod) => {
                      setModalMode("edit");
                      setSelectedProduct(prod);
                      setModalOpen(true);
                    }}
                    onDelete={handleDelete}
                  />
                ))}
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
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                Previous
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => fetchProducts(p, debouncedSearch)}
                  className={`rounded border px-3 py-1 ${
                    page === p ? "bg-blue-600 text-white" : "bg-white hover:bg-gray-50"
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
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        product={selectedProduct}
        onSuccess={() => fetchProducts(page, debouncedSearch)}
      />
    </div>
  );
}
