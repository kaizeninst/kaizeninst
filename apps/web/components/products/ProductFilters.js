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
    </aside>
  );
}
