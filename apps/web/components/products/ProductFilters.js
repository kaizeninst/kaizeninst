"use client";
import React from "react";
import CategoryFilter from "@/components/products/CategoryFilter";

/**
 * Sidebar filter for products page
 * Includes: Category, Status, Items per page
 */
export default function ProductFilters({
  selectedCategoryId,
  onSelectCategory,
  status,
  onChangeStatus,
  limit,
  onChangeLimit,
}) {
  return (
    <aside className="space-y-4 md:w-1/4">
      {/* Category Filter */}
      <CategoryFilter selectedId={selectedCategoryId} onSelect={onSelectCategory} />

      {/* Status */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
        <select
          value={status}
          onChange={(e) => onChangeStatus(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        >
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Items per page */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Items per page</label>
        <select
          value={limit}
          onChange={(e) => onChangeLimit(Number(e.target.value))}
          className="w-full rounded-lg border px-3 py-2"
        >
          <option value={8}>8</option>
          <option value={12}>12</option>
          <option value={24}>24</option>
        </select>
      </div>
    </aside>
  );
}
