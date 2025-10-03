"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

import Pagination from "@/components/common/Pagination";
import ProductCard from "@/components/products/ProductCard";
import CategoryFilter from "@/components/products/CategoryFilter";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // query states (sync กับ URL)
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    searchParams.get("category_id") ? Number(searchParams.get("category_id")) : "All"
  );
  const [status, setStatus] = useState(searchParams.get("status") || ""); // optional
  const [page, setPage] = useState(Number(searchParams.get("page") || 1));
  const [limit, setLimit] = useState(Number(searchParams.get("limit") || 12));

  // data states
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // helper: push query
  const pushQuery = (patch) => {
    const qs = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "" || v === "All") qs.delete(k);
      else qs.set(k, String(v));
    });

    // reset page เมื่อ filter เปลี่ยน
    if (
      patch.search !== undefined ||
      patch.category_id !== undefined ||
      patch.status !== undefined ||
      patch.limit !== undefined
    ) {
      qs.delete("page");
    }

    router.push(`${pathname}?${qs.toString()}`, { scroll: false });
  };

  // sync state เมื่อ URL เปลี่ยน
  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
    setSelectedCategoryId(
      searchParams.get("category_id") ? Number(searchParams.get("category_id")) : "All"
    );
    setStatus(searchParams.get("status") || "");
    setPage(Number(searchParams.get("page") || 1));
    setLimit(Number(searchParams.get("limit") || 12));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams?.toString()]);

  // fetch จาก proxy ด้วย server-side filters + pagination
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const qs = new URLSearchParams();
        qs.set("page", String(page));
        qs.set("limit", String(limit));
        if (searchTerm) qs.set("search", searchTerm);
        if (status) qs.set("status", status);
        if (selectedCategoryId !== "All" && !Number.isNaN(Number(selectedCategoryId))) {
          qs.set("category_id", String(selectedCategoryId));
        }

        const res = await fetch(`/api/products?${qs.toString()}`, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Fetch products failed");

        setItems(json?.data || []);
        setPagination(json?.pagination || { total: 0, page: 1, limit, totalPages: 1 });
      } catch (err) {
        console.error("Load products error:", err);
        setError("Cannot load products");
      } finally {
        setLoading(false);
      }
    })();
  }, [page, limit, searchTerm, status, selectedCategoryId]);

  // ถ้ายังอยากมี sort ฝั่ง client (ชั่วคราว เฉพาะหน้า current page)
  const pageItems = useMemo(() => items, [items]);

  return (
    <div className="container mx-auto p-8">
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Sidebar */}
        <aside className="space-y-4 md:w-1/4">
          <CategoryFilter
            selectedId={selectedCategoryId}
            onSelect={(id) => {
              setSelectedCategoryId(id);
              pushQuery({ category_id: id });
            }}
          />

          {/* Status filter (optional) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                pushQuery({ status: e.target.value });
              }}
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Page size */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Items per page</label>
            <select
              value={limit}
              onChange={(e) => {
                const v = Number(e.target.value);
                setLimit(v);
                pushQuery({ limit: v });
              }}
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value={8}>8</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
            </select>
          </div>
        </aside>

        {/* Main */}
        <main className="md:w-3/4">
          {/* Search */}
          <div className="mb-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  pushQuery({ search: e.target.value });
                }}
                className="border-secondary text-foreground focus:ring-primary w-full rounded-lg border py-2 pl-10 pr-4 focus:outline-none focus:ring-2"
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-secondary h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Grid */}
          {loading && <p>Loading products...</p>}
          {error && <p className="text-red-500">{error}</p>}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {!loading && pageItems.length > 0
              ? pageItems.map((p) => <ProductCard key={p.id} product={p} />)
              : !loading && (
                  <p className="text-secondary col-span-full text-center">No products found.</p>
                )}
          </div>

          {/* Pagination */}
          {pagination?.totalPages > 1 && (
            <Pagination
              pagination={pagination}
              page={pagination.page}
              onPageChange={(p) => {
                setPage(p);
                pushQuery({ page: p });
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}
