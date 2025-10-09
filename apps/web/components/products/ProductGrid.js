"use client";
import React from "react";
import ProductCard from "@/components/products/ProductCard";

/**
 * Display list of products in a responsive grid
 */
export default function ProductGrid({ loading, error, products }) {
  if (loading) return <p>Loading products...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  if (!loading && products.length === 0)
    return <p className="text-secondary col-span-full text-center">No products found.</p>;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
