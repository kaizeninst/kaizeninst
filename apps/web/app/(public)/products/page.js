"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

import Pagination from "@/components/common/Pagination";
import ProductFilters from "@/components/products/ProductFilters";
import ProductSearch from "@/components/products/ProductSearch";
import ProductGrid from "@/components/products/ProductGrid";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // query states
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    searchParams.get("category_id") ? Number(searchParams.get("category_id")) : "All"
  );
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [page, setPage] = useState(Number(searchParams.get("page") || 1));
  const [limit, setLimit] = useState(Number(searchParams.get("limit") || 12));

  // data states
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // push query parameters
  const pushQuery = (patch) => {
    const qs = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "" || v === "All") qs.delete(k);
      else qs.set(k, String(v));
    });
    if (patch.search || patch.category_id || patch.status || patch.limit) qs.delete("page");

    router.push(`${pathname}?${qs.toString()}`, { scroll: false });
  };

  // sync states with URL
  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
    setSelectedCategoryId(
      searchParams.get("category_id") ? Number(searchParams.get("category_id")) : "All"
    );
    setStatus(searchParams.get("status") || "");
    setPage(Number(searchParams.get("page") || 1));
    setLimit(Number(searchParams.get("limit") || 12));
  }, [searchParams?.toString()]);

  // fetch data
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
          qs.set("descendants", "1");
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

  const pageItems = useMemo(() => items, [items]);

  return (
    <div className="container mx-auto p-8">
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Sidebar */}
        <ProductFilters
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={(id) => {
            setSelectedCategoryId(id);
            pushQuery({ category_id: id, descendants: 1 });
          }}
          status={status}
          onChangeStatus={(v) => {
            setStatus(v);
            pushQuery({ status: v });
          }}
          limit={limit}
          onChangeLimit={(v) => {
            setLimit(v);
            pushQuery({ limit: v });
          }}
        />

        {/* Main */}
        <main className="md:w-3/4">
          <ProductSearch
            value={searchTerm}
            onChange={(v) => {
              setSearchTerm(v);
              pushQuery({ search: v });
            }}
          />

          <ProductGrid loading={loading} error={error} products={pageItems} />

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
